package com.botcab.driver;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.JwtService;
import com.botcab.common.auth.Role;
import com.botcab.rider.AuthResponse;
import com.botcab.rider.LoginRequest;
import com.botcab.rider.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DriverAuthService {

    private final DriverRepository drivers;
    private final PasswordEncoder passwords;
    private final JwtService jwt;

    public DriverAuthService(DriverRepository drivers, PasswordEncoder passwords, JwtService jwt) {
        this.drivers = drivers;
        this.passwords = passwords;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest request) {
        String phone = request.phone().trim();
        if (drivers.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
        }
        Driver driver = drivers.save(new Driver(
                request.fullName().trim(),
                phone,
                passwords.encode(request.password())));
        return toAuth(driver);
    }

    public AuthResponse login(LoginRequest request) {
        Driver driver = drivers.findByPhone(request.phone().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Wrong phone or password"));
        if (!passwords.matches(request.password(), driver.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong phone or password");
        }
        return toAuth(driver);
    }

    public DriverMeResponse me(AuthPrincipal principal) {
        if (principal.role() != Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Driver login required");
        }
        Driver driver = drivers.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
        return new DriverMeResponse(
                driver.getId(), driver.getFullName(), driver.getPhone(), driver.getStatus().name());
    }

    private AuthResponse toAuth(Driver driver) {
        return new AuthResponse(
                jwt.sign(driver.getId(), driver.getPhone(), driver.getFullName(), Role.DRIVER),
                driver.getId(),
                driver.getFullName(),
                driver.getPhone(),
                Role.DRIVER.name());
    }
}
