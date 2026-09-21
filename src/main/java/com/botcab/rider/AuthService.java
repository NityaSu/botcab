package com.botcab.rider;

import com.botcab.common.auth.JwtService;
import com.botcab.common.auth.RiderPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final RiderRepository riders;
    private final PasswordEncoder passwords;
    private final JwtService jwt;

    public AuthService(RiderRepository riders, PasswordEncoder passwords, JwtService jwt) {
        this.riders = riders;
        this.passwords = passwords;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest request) {
        String phone = request.phone().trim();
        if (riders.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
        }
        Rider rider = riders.save(new Rider(
                request.fullName().trim(),
                phone,
                passwords.encode(request.password())));
        return toAuth(rider);
    }

    public AuthResponse login(LoginRequest request) {
        Rider rider = riders.findByPhone(request.phone().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Wrong phone or password"));
        if (!passwords.matches(request.password(), rider.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong phone or password");
        }
        return toAuth(rider);
    }

    public RiderMeResponse me(RiderPrincipal principal) {
        Rider rider = riders.findById(principal.riderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
        return new RiderMeResponse(rider.getId(), rider.getFullName(), rider.getPhone());
    }

    private AuthResponse toAuth(Rider rider) {
        return new AuthResponse(jwt.sign(rider), rider.getId(), rider.getFullName(), rider.getPhone());
    }
}
