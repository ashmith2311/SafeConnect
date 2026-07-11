package com.safeconnect.backend.dto;

import com.safeconnect.backend.entity.EmergencyCategory;
import com.safeconnect.backend.entity.Priority;
import java.time.LocalDateTime;

public class EmergencyReportRequest {
    private String title;
    private String description;
    private EmergencyCategory category;
    private Priority priority;
    private Double latitude;
    private Double longitude;
    private String locationAddress;
    private LocalDateTime incidentDateTime;

    public EmergencyReportRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EmergencyCategory getCategory() { return category; }
    public void setCategory(EmergencyCategory category) { this.category = category; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public LocalDateTime getIncidentDateTime() { return incidentDateTime; }
    public void setIncidentDateTime(LocalDateTime incidentDateTime) { this.incidentDateTime = incidentDateTime; }
}
