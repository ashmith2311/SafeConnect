package com.safeconnect.backend.dto;

import java.util.List;

public class SOSResponse {
    private Long reportId;
    private String message;
    private Double latitude;
    private Double longitude;
    private List<NearbyService> nearbyServices;

    public SOSResponse() {}

    public SOSResponse(Long reportId, String message, Double latitude, Double longitude, List<NearbyService> nearbyServices) {
        this.reportId = reportId;
        this.message = message;
        this.latitude = latitude;
        this.longitude = longitude;
        this.nearbyServices = nearbyServices;
    }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<NearbyService> getNearbyServices() { return nearbyServices; }
    public void setNearbyServices(List<NearbyService> nearbyServices) { this.nearbyServices = nearbyServices; }
}
