package com.botcab.rider;

import com.botcab.common.auth.JwtProperties;
import com.botcab.common.auth.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    RiderRepository riders;

    AuthService auth;

    @BeforeEach
    void setUp() {
        JwtService jwt = new JwtService(new JwtProperties("botcab-dev-jwt-secret-change-me-32b", 7));
        auth = new AuthService(riders, new BCryptPasswordEncoder(), jwt);
    }

    @Test
    void loginReturnsToken() {
        String hash = new BCryptPasswordEncoder().encode("demo");
        Rider rider = new Rider("Maya", "+855000000101", hash);
        setId(rider, 1L);
        when(riders.findByPhone("+855000000101")).thenReturn(Optional.of(rider));

        AuthResponse res = auth.login(new LoginRequest("+855000000101", "demo"));
        assertEquals(1L, res.riderId());
        assertEquals("Maya", res.fullName());
        assertEquals("+855000000101", res.phone());
        org.junit.jupiter.api.Assertions.assertFalse(res.token().isBlank());
    }

    @Test
    void loginRejectsBadPassword() {
        String hash = new BCryptPasswordEncoder().encode("demo");
        Rider rider = new Rider("Maya", "+855000000101", hash);
        when(riders.findByPhone("+855000000101")).thenReturn(Optional.of(rider));

        assertThrows(ResponseStatusException.class, () ->
                auth.login(new LoginRequest("+855000000101", "nope")));
    }

    @Test
    void registerRejectsDuplicatePhone() {
        when(riders.existsByPhone("+8551")).thenReturn(true);
        assertThrows(ResponseStatusException.class, () ->
                auth.register(new RegisterRequest("A", "+8551", "demo")));
    }

    private static void setId(Rider rider, long id) {
        try {
            var f = Rider.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(rider, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
