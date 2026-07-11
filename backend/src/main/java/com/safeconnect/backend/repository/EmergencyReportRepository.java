package com.safeconnect.backend.repository;

import com.safeconnect.backend.entity.EmergencyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, Long> {
}
