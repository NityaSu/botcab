package com.botcab.common;

import com.botcab.fare.FareAlreadyExistsException;
import com.botcab.fare.FareNotFoundException;
import com.botcab.matching.NoDriverAvailableException;
import com.botcab.matching.OfferNotFoundException;
import com.botcab.ride.IllegalRideTransitionException;
import com.botcab.ride.RideCancelNotAllowedException;
import com.botcab.ride.RideNotFoundException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(NoDriverAvailableException.class)
    public ResponseEntity<Map<String, String>> noDriver(NoDriverAvailableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(OfferNotFoundException.class)
    public ResponseEntity<Map<String, String>> noOffer(OfferNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler({RideNotFoundException.class, FareNotFoundException.class})
    public ResponseEntity<Map<String, String>> notFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler({
            IllegalRideTransitionException.class,
            RideCancelNotAllowedException.class,
            FareAlreadyExistsException.class,
            OptimisticLockingFailureException.class
    })
    public ResponseEntity<Map<String, String>> conflict(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("error", String.valueOf(ex.getReason())));
    }
}
