package com.botcab.common.auth;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotBlank handles null/blank
        }
        if (value.length() < 8 || value.length() > 72) {
            return false;
        }
        boolean letter = false;
        boolean digit = false;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (Character.isLetter(c)) {
                letter = true;
            } else if (Character.isDigit(c)) {
                digit = true;
            }
        }
        return letter && digit;
    }
}
