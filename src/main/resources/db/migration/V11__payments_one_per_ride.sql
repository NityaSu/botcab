-- Phase 18: one mock payment per ride. Status is CAPTURED or FAILED on complete.
CREATE UNIQUE INDEX ux_payments_ride_id ON payments (ride_id);

ALTER TABLE payments
    ADD CONSTRAINT payments_status_check
        CHECK (status IN ('PENDING', 'CAPTURED', 'FAILED'));
