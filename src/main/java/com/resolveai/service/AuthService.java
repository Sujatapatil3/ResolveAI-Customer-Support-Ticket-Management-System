
package com.resolveai.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.resolveai.dto.RegisterRequest;
import com.resolveai.entity.AppUser;
import com.resolveai.exception.EmailAlreadyExistsException;
import com.resolveai.repository.AppUserRepository;
import java.util.Locale;
import org.springframework.security.authentication.BadCredentialsException;
import com.resolveai.dto.AuthResponse;
import com.resolveai.dto.LoginRequest;
import com.resolveai.security.JwtService;
import com.resolveai.entity.UserRole;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException(
                    "An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setRole(UserRole.CUSTOMER);
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        appUserRepository.save(user);
    }
    
    
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );
        return new AuthResponse(token, "Bearer");
    }
    
    
    
    
    
    
}
