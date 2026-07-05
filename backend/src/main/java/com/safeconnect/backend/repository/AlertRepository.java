package com.safeconnect.backend.repository;

import com.safeconnect.backend.entity.Alert;
import com.safeconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserOrderByTimestampDesc(User user);
}
