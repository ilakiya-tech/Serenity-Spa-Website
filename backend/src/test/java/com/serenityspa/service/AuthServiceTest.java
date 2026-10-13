package com.serenityspa.service;

import com.serenityspa.dto.AuthResponse;
import com.serenityspa.dto.LoginRequest;
import com.serenityspa.dto.RegisterRequest;
import com.serenityspa.entity.Role;
import com.serenityspa.entity.User;
import com.serenityspa.exception.ConflictException;
import com.serenityspa.repository.UserRepository;
import com.serenityspa.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Jane Doe", "jane@example.com", "encodedPassword", Role.ROLE_CUSTOMER);
        sampleUser.setId(1L);
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest("Jane Doe", "jane@example.com", "secret123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken("jane@example.com")).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("jane@example.com", resp.getEmail());
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals(Role.ROLE_CUSTOMER, resp.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ThrowsConflict_WhenEmailExists() {
        RegisterRequest req = new RegisterRequest("Jane Doe", "jane@example.com", "secret123");
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_ThrowsException_WhenPasswordsDoNotMatch() {
        RegisterRequest req = new RegisterRequest("Jane Doe", "jane@example.com", "secret123", "mismatch");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(req));
        assertEquals("Passwords do not match", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest("jane@example.com", "secret123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateToken("jane@example.com")).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("jane@example.com", resp.getEmail());
        assertEquals("mock-jwt-token", resp.getToken());
    }
}
