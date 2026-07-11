package com.safeconnect.backend.dto;

public class NearbyService {
    private String name;
    private String type;
    private Double distance;
    private String phoneNumber;

    public NearbyService() {}

    public NearbyService(String name, String type, Double distance, String phoneNumber) {
        this.name = name;
        this.type = type;
        this.distance = distance;
        this.phoneNumber = phoneNumber;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
