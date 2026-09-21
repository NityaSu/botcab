-- Phase 9: rider accounts (phone + password, AutoWallet-style login).

ALTER TABLE riders
    ADD COLUMN password_hash VARCHAR(100);

-- Demo Rider Maya (V4) — password: demo
UPDATE riders
SET password_hash = '$2b$10$seoduVGQUCLf43OYMQ6nC.tiin/50YIBH56Q623poGTM5aD6G2Bbu'
WHERE password_hash IS NULL;

ALTER TABLE riders
    ALTER COLUMN password_hash SET NOT NULL;
