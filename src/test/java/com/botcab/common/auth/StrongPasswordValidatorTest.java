package com.botcab.common.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StrongPasswordValidatorTest {

    private final StrongPasswordValidator validator = new StrongPasswordValidator();

    @Test
    void acceptsLetterAndDigit() {
        assertTrue(validator.isValid("Demo1234", null));
        assertTrue(validator.isValid("abcdefgh1", null));
    }

    @Test
    void rejectsShortOrLettersOnlyOrDigitsOnly() {
        assertFalse(validator.isValid("Demo12", null));
        assertFalse(validator.isValid("password", null));
        assertFalse(validator.isValid("12345678", null));
        assertFalse(validator.isValid("demo", null));
    }
}
