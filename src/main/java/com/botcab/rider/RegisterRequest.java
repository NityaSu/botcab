package com.botcab.rider;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(max = 32) String phone,
        @NotBlank @Size(min = 4, max = 72) String password
) {
}
