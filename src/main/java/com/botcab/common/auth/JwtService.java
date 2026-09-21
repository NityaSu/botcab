package com.botcab.common.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties props;
    private final SecretKey key;

    public JwtService(JwtProperties props) {
        this.props = props;
        byte[] bytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("botcab.jwt.secret must be at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String sign(long id, String phone, String fullName, Role role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.ttlDays() * 24 * 3600);
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("phone", phone)
                .claim("name", fullName)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public AuthPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        long id = Long.parseLong(claims.getSubject());
        String phone = claims.get("phone", String.class);
        String name = claims.get("name", String.class);
        Role role = Role.valueOf(claims.get("role", String.class));
        return new AuthPrincipal(id, phone, name, role);
    }
}
