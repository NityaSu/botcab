package com.botcab.rider;

public record AuthResponse(
        String token,
        long riderId,
        String fullName,
        String phone
) {
}
