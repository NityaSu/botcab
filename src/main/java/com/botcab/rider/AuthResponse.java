package com.botcab.rider;

public record AuthResponse(
        String token,
        long userId,
        String fullName,
        String phone,
        String role
) {
}
