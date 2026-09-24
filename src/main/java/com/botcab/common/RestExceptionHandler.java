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
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fe.getField(), fe.getDefaultMessage() != null
                    ? fe.getDefaultMessage()
                    : "Invalid value");
        }
        return ResponseEntity.badRequest().body(ApiError.validation(fields));
    }

    @ExceptionHandler(NoDriverAvailableException.class)
    public ResponseEntity<ApiError> noDriver(NoDriverAvailableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.message("NO_DRIVER", ex.getMessage()));
    }

    @ExceptionHandler(OfferNotFoundException.class)
    public ResponseEntity<ApiError> noOffer(OfferNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.message("OFFER_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler({RideNotFoundException.class, FareNotFoundException.class})
    public ResponseEntity<ApiError> notFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.message("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler({
            IllegalRideTransitionException.class,
            RideCancelNotAllowedException.class,
            FareAlreadyExistsException.class,
            OptimisticLockingFailureException.class
    })
    public ResponseEntity<ApiError> conflict(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.message("CONFLICT", ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(ResponseStatusException ex) {
        String code = switch (ex.getStatusCode().value()) {
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 409 -> "CONFLICT";
            case 429 -> "RATE_LIMITED";
            default -> "HTTP_" + ex.getStatusCode().value();
        };
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiError.message(code, String.valueOf(ex.getReason())));
    }
}
