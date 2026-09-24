-- Phase 11: stronger demo passwords (Demo1234 — letter + digit, length ≥ 8).
-- Spring BCrypt ($2a$).

UPDATE riders
SET password_hash = '$2a$10$VAiilqZD7punhKdwUbtYsuiSeY0KHDD.L6MU4URjSg6DgMO8L0vua'
WHERE phone = '+855000000101';

UPDATE drivers
SET password_hash = '$2a$10$VAiilqZD7punhKdwUbtYsuiSeY0KHDD.L6MU4URjSg6DgMO8L0vua'
WHERE phone IN ('+855000000011', '+855000000012', '+855000000013');
