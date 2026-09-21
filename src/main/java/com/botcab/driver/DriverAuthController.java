package com.botcab.driver;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.rider.AuthResponse;
import com.botcab.rider.LoginRequest;
import com.botcab.rider.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/drivers")
public class DriverAuthController {

    private final DriverAuthService auth;

    public DriverAuthController(DriverAuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest body) {
        return auth.register(body);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest body) {
        return auth.login(body);
    }

    @GetMapping("/me")
    public DriverMeResponse me() {
        return auth.me(AuthPrincipal.require());
    }
}
