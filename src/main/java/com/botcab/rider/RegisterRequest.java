package com.botcab.rider;

import com.botcab.common.auth.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank
        @Size(max = 32)
        @Pattern(regexp = "\\+[1-9]\\d{7,14}", message = "Phone must be E.164 style, e.g. +855000000101")
        String phone,
        @NotBlank @StrongPassword String password
) {
}
