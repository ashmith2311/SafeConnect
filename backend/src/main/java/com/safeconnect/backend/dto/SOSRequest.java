package com.safeconnect.backend.dto;

import com.safeconnect.backend.entity.EmergencyCategory;

public class SOSRequest {
    private EmergencyCategory category;
    private String message;
    private Double latitude;
    private Double longitude;

    public SOSRequest() {}

    public EmergencyCategory getCategory() { return category; }
    public void setCategory(EmergencyCategory category) { this.category = category; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
