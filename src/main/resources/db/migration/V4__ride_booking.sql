-- Phase 4: optimistic locking on rides + a demo rider for booking HTTP.

ALTER TABLE rides
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

INSERT INTO riders (full_name, phone) VALUES
    ('Demo Rider Maya', '+855000000101');
