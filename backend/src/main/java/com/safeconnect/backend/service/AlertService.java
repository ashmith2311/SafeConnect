package com.safeconnect.backend.service;

import com.safeconnect.backend.dto.AlertRequest;
import com.safeconnect.backend.entity.Alert;
import com.safeconnect.backend.entity.User;
import com.safeconnect.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert createAlert(AlertRequest request, User user) {
        Alert alert = new Alert();
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setTimestamp(LocalDateTime.now());
        alert.setUser(user);
        return alertRepository.save(alert);
    }

    public List<Alert> getAlertsByUser(User user) {
        return alertRepository.findByUserOrderByTimestampDesc(user);
    }
}
