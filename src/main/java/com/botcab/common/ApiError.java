package com.botcab.common;

import java.util.Map;

/** Uniform API error body. Always includes {@code error}; optional {@code code} and {@code fields}. */
public record ApiError(String error, String code, Map<String, String> fields) {

    public static ApiError message(String code, String error) {
        return new ApiError(error, code, Map.of());
    }

    public static ApiError validation(Map<String, String> fields) {
        return new ApiError("Validation failed", "VALIDATION_ERROR", fields);
    }
}
