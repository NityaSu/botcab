-- Fix demo rider password: V6 used a PHP bcrypt that Spring BCryptPasswordEncoder rejects.
-- Password remains: demo

UPDATE riders
SET password_hash = '$2a$10$WIy12e.E0AcNSyDPnEZhX.hqRMyVzTFcx8cs2r2AUISu3lHAurprS'
WHERE phone = '+855000000101';
