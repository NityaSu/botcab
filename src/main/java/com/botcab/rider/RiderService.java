package com.botcab.rider;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RiderService {

    private final RiderRepository riders;

    public RiderService(RiderRepository riders) {
        this.riders = riders;
    }

    public Rider require(long riderId) {
        return riders.findById(riderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Rider not found: " + riderId));
    }
}
