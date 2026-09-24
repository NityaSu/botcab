package com.botcab.driver;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.JwtService;
import com.botcab.common.auth.LoginAttemptService;
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
    private final LoginAttemptService loginAttempts;

    public DriverAuthService(
            DriverRepository drivers,
            PasswordEncoder passwords,
            JwtService jwt,
            LoginAttemptService loginAttempts) {
        this.drivers = drivers;
        this.passwords = passwords;
        this.jwt = jwt;
        this.loginAttempts = loginAttempts;
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
        String phone = request.phone().trim();
        String key = "driver:" + phone;
        loginAttempts.checkAllowed(key);
        Driver driver = drivers.findByPhone(phone).orElse(null);
        if (driver == null || !passwords.matches(request.password(), driver.getPasswordHash())) {
            loginAttempts.recordFailure(key);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong phone or password");
        }
        loginAttempts.recordSuccess(key);
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
