-- Phase 10: driver accounts (phone + password).

ALTER TABLE drivers
    ADD COLUMN password_hash VARCHAR(100);

-- Demo drivers (V2/V3) — password: demo (Spring BCrypt)
UPDATE drivers
SET password_hash = '$2a$10$WIy12e.E0AcNSyDPnEZhX.hqRMyVzTFcx8cs2r2AUISu3lHAurprS'
WHERE password_hash IS NULL;

ALTER TABLE drivers
    ALTER COLUMN password_hash SET NOT NULL;
