package com.botcab.driver;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
        drivers.pingLocation(id, body.lat(), body.lng());
    }

    @PostMapping("/available")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void available(@PathVariable("id") long id) {
        drivers.goAvailable(id);
    }

    @PostMapping("/offline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void offline(@PathVariable("id") long id) {
        drivers.goOffline(id);
    }
}
