package com.safeconnect.backend.repository;

import com.safeconnect.backend.entity.User;
import com.safeconnect.backend.entity.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRoles_Name(ERole roleName);
}
