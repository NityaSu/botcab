package com.botcab.common.auth;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

/** Authenticated rider carried in the SecurityContext (JWT subject). */
public record RiderPrincipal(long riderId, String phone, String fullName) {

    public Authentication toAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                this,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_RIDER")));
    }

    public static Optional<RiderPrincipal> current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof RiderPrincipal rider) {
            return Optional.of(rider);
        }
        return Optional.empty();
    }

    public static long requireRiderId() {
        return current()
                .map(RiderPrincipal::riderId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Login required"));
    }
}
