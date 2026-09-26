package com.botcab.common.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

/** Authenticated user from JWT (rider or driver). */
public record AuthPrincipal(long id, String phone, String fullName, Role role) implements Principal {

    /** STOMP / {@code convertAndSendToUser} name, e.g. {@code driver:1}. */
    public static String stompName(Role role, long id) {
        return role.name().toLowerCase() + ":" + id;
    }

    @Override
    public String getName() {
        return stompName(role, id);
    }

    public Authentication toAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                this,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
    }

    public static Optional<AuthPrincipal> current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static AuthPrincipal require() {
        return current().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Login required"));
    }

    public static long requireRiderId() {
        AuthPrincipal p = require();
        if (p.role() != Role.RIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rider login required");
        }
        return p.id();
    }

    public static long requireDriverId() {
        AuthPrincipal p = require();
        if (p.role() != Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Driver login required");
        }
        return p.id();
    }
}
