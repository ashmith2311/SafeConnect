package com.safeconnect.backend.service;

import com.safeconnect.backend.entity.*;
import com.safeconnect.backend.repository.*;
import com.safeconnect.backend.dto.*;
import com.safeconnect.backend.exception.ResourceNotFoundException;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmergencyReportService {

    private static final Logger log = LoggerFactory.getLogger(EmergencyReportService.class);

    private final EmergencyReportRepository reportRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final JavaMailSender mailSender;

    @Value("${twilio.account.sid:}")
    private String twilioSid;
    
    @Value("${twilio.auth.token:}")
    private String twilioToken;
    
    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    public EmergencyReportService(EmergencyReportRepository reportRepository,
                                 UserRepository userRepository,
                                 NotificationRepository notificationRepository,
                                 EmergencyContactRepository emergencyContactRepository,
                                 JavaMailSender mailSender) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public EmergencyReport createReport(EmergencyReportRequest request) {
        User currentUser = getCurrentUser();
        
        EmergencyReport report = new EmergencyReport();
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(request.getCategory());
        report.setPriority(request.getPriority());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setLocationAddress(request.getLocationAddress());
        report.setReportedBy(currentUser);
        report.setIncidentDateTime(request.getIncidentDateTime() != null ? 
            request.getIncidentDateTime() : LocalDateTime.now());
        report.setStatus(ReportStatus.PENDING);
        
        EmergencyReport savedReport = reportRepository.save(report);
        
        // Send notifications
        sendEmergencyNotifications(savedReport);
        
        // Send email
        sendEmergencyEmail(savedReport);
        
        // Send SMS if Twilio configured
        if (request.getPriority() == Priority.URGENT || request.getPriority() == Priority.HIGH) {
            sendEmergencySMS(savedReport);
        }
        
        return savedReport;
    }

    @Transactional
    public SOSResponse sendSOS(SOSRequest request) {
        User currentUser = getCurrentUser();
        
        // Create emergency report automatically
        EmergencyReport sosReport = new EmergencyReport();
        sosReport.setTitle("SOS Emergency - " + request.getCategory());
        sosReport.setDescription(request.getMessage());
        sosReport.setCategory(request.getCategory());
        sosReport.setPriority(Priority.URGENT);
        sosReport.setLatitude(request.getLatitude());
        sosReport.setLongitude(request.getLongitude());
        sosReport.setReportedBy(currentUser);
        sosReport.setStatus(ReportStatus.IN_PROGRESS);
        
        EmergencyReport savedReport = reportRepository.save(sosReport);
        
        // Send SOS notifications to emergency contacts
        List<EmergencyContact> contacts = getEmergencyContacts(currentUser.getId());
        for (EmergencyContact contact : contacts) {
            sendSOSMessage(contact, savedReport, currentUser);
        }
        
        // Notify nearest emergency services
        notifyNearestServices(savedReport);
        
        return new SOSResponse(
            savedReport.getId(),
            "SOS Alert sent successfully",
            request.getLatitude(),
            request.getLongitude(),
            getNearbyServices(request.getLatitude(), request.getLongitude())
        );
    }

    private void sendEmergencyNotifications(EmergencyReport report) {
        // Notify admins and relevant emergency services
        List<User> admins = userRepository.findByRoles_Name(ERole.ROLE_ADMIN);
        String message = String.format("New %s emergency report: %s", 
            report.getCategory(), report.getTitle());
        
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle("New Emergency Report");
            notification.setMessage(message);
            notification.setType("EMERGENCY");
            notification.setLink("/reports/" + report.getId());
            notificationRepository.save(notification);
        }
    }

    private void sendEmergencyEmail(EmergencyReport report) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo("admin@safeconnect.com");
            email.setSubject("🚨 New Emergency Report: " + report.getTitle());
            email.setText(String.format(
                "A new emergency has been reported:\n\n" +
                "Category: %s\n" +
                "Title: %s\n" +
                "Description: %s\n" +
                "Priority: %s\n" +
                "Location: %s\n" +
                "Reported by: %s\n\n" +
                "Please take immediate action.",
                report.getCategory(),
                report.getTitle(),
                report.getDescription(),
                report.getPriority(),
                report.getLocationAddress(),
                report.getReportedBy().getFullName()
            ));
            mailSender.send(email);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }

    private void sendEmergencySMS(EmergencyReport report) {
        try {
            if (twilioSid == null || twilioSid.isEmpty()) return;
            Twilio.init(twilioSid, twilioToken);
            
            String message = String.format(
                "🚨 URGENT: %s emergency reported at %s. Priority: %s. Please respond immediately.",
                report.getCategory(),
                report.getLocationAddress(),
                report.getPriority()
            );
            
            // Send to emergency contacts
            List<EmergencyContact> contacts = getEmergencyContacts(report.getReportedBy().getId());
            for (EmergencyContact contact : contacts) {
                Message.creator(
                    new PhoneNumber(contact.getPhoneNumber()),
                    new PhoneNumber(twilioPhoneNumber),
                    message
                ).create();
            }
        } catch (Exception e) {
            log.error("Failed to send SMS: {}", e.getMessage());
        }
    }

    private void sendSOSMessage(EmergencyContact contact, EmergencyReport report, User user) {
        try {
            String message = String.format(
                "🚨 SOS ALERT from %s!\n\n" +
                "Location: %s\n" +
                "Message: %s\n" +
                "Please contact immediately.",
                user.getFullName(),
                report.getLocationAddress(),
                report.getDescription()
            );
            
            // Send SMS
            if (twilioSid != null && !twilioSid.isEmpty()) {
                Twilio.init(twilioSid, twilioToken);
                Message.creator(
                    new PhoneNumber(contact.getPhoneNumber()),
                    new PhoneNumber(twilioPhoneNumber),
                    message
                ).create();
            }
            
            // Send email
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(contact.getPhoneNumber() + "@sms.emergency.com");
            email.setSubject("🚨 SOS Alert from " + user.getFullName());
            email.setText(message);
            mailSender.send(email);
            
        } catch (Exception e) {
            log.error("Failed to send SOS message: {}", e.getMessage());
        }
    }

    private List<EmergencyContact> getEmergencyContacts(Long userId) {
        return emergencyContactRepository.findByUserId(userId);
    }

    private void notifyNearestServices(EmergencyReport report) {
        // Implementation to notify nearest police, hospital, fire station
        List<NearbyService> nearbyServices = getNearbyServices(
            report.getLatitude(), 
            report.getLongitude()
        );
        // Send notifications to nearest services
    }

    private List<NearbyService> getNearbyServices(Double lat, Double lng) {
        // Implementation to find nearby emergency services
        return new ArrayList<>();
    }

    public List<EmergencyReport> getNearbyReports(Double lat, Double lng, Double radius) {
        // Implementation to find nearby reports
        return new ArrayList<>();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new SecurityException("User not authenticated");
    }
}
