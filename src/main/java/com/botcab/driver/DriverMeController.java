package com.botcab.driver;

import com.botcab.common.auth.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Driver self-service — id always from JWT (no path id spoofing). */
@RestController
@RequestMapping("/api/drivers/me")
public class DriverMeController {

    private final DriverService drivers;

    public DriverMeController(DriverService drivers) {
        this.drivers = drivers;
    }

    @PostMapping("/location")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ping(@Valid @RequestBody LocationPingRequest body) {
        drivers.pingLocation(AuthPrincipal.requireDriverId(), body.lat(), body.lng());
    }

    @PostMapping("/available")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void available() {
        drivers.goAvailable(AuthPrincipal.requireDriverId());
    }

    @PostMapping("/offline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void offline() {
        drivers.goOffline(AuthPrincipal.requireDriverId());
    }
}
