package com.safeconnect.backend.service;

import com.safeconnect.backend.dto.AuthRequest;
import com.safeconnect.backend.dto.AuthResponse;
import com.safeconnect.backend.dto.RegisterRequest;
import com.safeconnect.backend.entity.User;
import com.safeconnect.backend.entity.Role;
import com.safeconnect.backend.entity.ERole;
import com.safeconnect.backend.repository.UserRepository;
import com.safeconnect.backend.repository.RoleRepository;
import com.safeconnect.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
            .orElseGet(() -> roleRepository.save(new Role(null, roleName)));
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPhoneNumber(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt Hash!

        Set<Role> roles = new HashSet<>();
        // Assign role automatically based on email domain
        if (request.getEmail().toLowerCase().endsWith("@safeconnect.gov")) {
            roles.add(getOrCreateRole(ERole.ROLE_ADMIN));
        } else {
            roles.add(getOrCreateRole(ERole.ROLE_USER));
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    public AuthResponse loginUser(AuthRequest request) {
        User user = userRepository.findByUsername(request.getEmail())
                .orElseGet(() -> userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        String token = jwtUtils.generateToken(user.getUsername());
        
        String roleStr = user.getRoles().stream()
            .map(r -> r.getName().toString())
            .findFirst()
            .orElse("ROLE_USER");

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), roleStr);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
