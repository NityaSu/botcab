-- Phase 19: cancel fee snapshot on the ride + driver earnings ledger.

ALTER TABLE rides
    ADD COLUMN cancelled_by VARCHAR(30),
    ADD COLUMN cancel_fee_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN cancel_policy VARCHAR(30);

ALTER TABLE rides
    ADD CONSTRAINT rides_cancelled_by_check
        CHECK (cancelled_by IS NULL OR cancelled_by IN ('RIDER', 'DRIVER', 'SYSTEM')),
    ADD CONSTRAINT rides_cancel_fee_non_negative
        CHECK (cancel_fee_cents >= 0);

CREATE TABLE driver_earnings (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    driver_id    BIGINT      NOT NULL REFERENCES drivers (id),
    ride_id      BIGINT      NOT NULL UNIQUE REFERENCES rides (id),
    amount_cents BIGINT      NOT NULL,
    kind         VARCHAR(30) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT driver_earnings_kind_check CHECK (kind IN ('TRIP', 'CANCEL_FEE')),
    CONSTRAINT driver_earnings_amount_non_negative CHECK (amount_cents >= 0)
);

CREATE INDEX idx_driver_earnings_driver_created
    ON driver_earnings (driver_id, created_at DESC);
