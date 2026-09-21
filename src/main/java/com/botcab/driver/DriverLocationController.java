package com.botcab.driver;

import com.botcab.common.auth.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Legacy path-id endpoints — driver id must match JWT. Prefer {@link DriverMeController}. */
@RestController
@RequestMapping("/api/drivers/{id}")
public class DriverLocationController {

    private final DriverService drivers;

    public DriverLocationController(DriverService drivers) {
        this.drivers = drivers;
    }

    @PostMapping("/location")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ping(@PathVariable("id") long id, @Valid @RequestBody LocationPingRequest body) {
        assertSelf(id);
        drivers.pingLocation(id, body.lat(), body.lng());
    }

    @PostMapping("/available")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void available(@PathVariable("id") long id) {
        assertSelf(id);
        drivers.goAvailable(id);
    }

    @PostMapping("/offline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void offline(@PathVariable("id") long id) {
        assertSelf(id);
        drivers.goOffline(id);
    }

    private static void assertSelf(long id) {
        if (AuthPrincipal.requireDriverId() != id) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot act as another driver");
        }
    }
}
