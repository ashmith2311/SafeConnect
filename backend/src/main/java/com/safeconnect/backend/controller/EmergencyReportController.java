package com.safeconnect.backend.controller;

import com.safeconnect.backend.dto.EmergencyReportRequest;
import com.safeconnect.backend.dto.SOSRequest;
import com.safeconnect.backend.dto.SOSResponse;
import com.safeconnect.backend.entity.EmergencyReport;
import com.safeconnect.backend.service.EmergencyReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class EmergencyReportController {

    private final EmergencyReportService reportService;

    public EmergencyReportController(EmergencyReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<EmergencyReport> createReport(@RequestBody EmergencyReportRequest request) {
        return ResponseEntity.ok(reportService.createReport(request));
    }

    @PostMapping("/sos")
    public ResponseEntity<SOSResponse> sendSOS(@RequestBody SOSRequest request) {
        return ResponseEntity.ok(reportService.sendSOS(request));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<EmergencyReport>> getNearbyReports(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "10.0") Double radius) {
        return ResponseEntity.ok(reportService.getNearbyReports(lat, lng, radius));
    }
}
