-- BotCab initial schema.
-- Conventions: identity BIGINT PKs, money in integer cents, enums as VARCHAR,
-- lat/lng as DECIMAL(9,6). No spatial types: matching is Redis GEO in Phase 2.

CREATE TABLE riders (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name  VARCHAR(120) NOT NULL,
    phone      VARCHAR(32)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name  VARCHAR(120) NOT NULL,
    phone      VARCHAR(32)  NOT NULL UNIQUE,
    status     VARCHAR(30)  NOT NULL DEFAULT 'OFFLINE',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    driver_id  BIGINT       NOT NULL REFERENCES drivers (id),
    plate      VARCHAR(16)  NOT NULL UNIQUE,
    make       VARCHAR(60)  NOT NULL,
    model      VARCHAR(60)  NOT NULL,
    seats      SMALLINT     NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE rides (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rider_id     BIGINT        NOT NULL REFERENCES riders (id),
    driver_id    BIGINT        REFERENCES drivers (id),
    status       VARCHAR(30)   NOT NULL,
    pickup_lat   DECIMAL(9, 6) NOT NULL,
    pickup_lng   DECIMAL(9, 6) NOT NULL,
    dropoff_lat  DECIMAL(9, 6) NOT NULL,
    dropoff_lng  DECIMAL(9, 6) NOT NULL,
    requested_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    matched_at   TIMESTAMPTZ,
    started_at   TIMESTAMPTZ,
    ended_at     TIMESTAMPTZ
);

CREATE TABLE ride_status_history (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ride_id     BIGINT      NOT NULL REFERENCES rides (id),
    from_status VARCHAR(30),
    to_status   VARCHAR(30) NOT NULL,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stub until Phase 5. Amounts are integer cents, never floating point.
CREATE TABLE fares (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ride_id     BIGINT      NOT NULL UNIQUE REFERENCES rides (id),
    total_cents BIGINT      NOT NULL,
    currency    CHAR(3)     NOT NULL DEFAULT 'EUR',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stub: payments stay mocked for the whole project.
CREATE TABLE payments (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ride_id      BIGINT      NOT NULL REFERENCES rides (id),
    amount_cents BIGINT      NOT NULL,
    status       VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Open requests, oldest first (Phase 2 matching).
CREATE INDEX idx_rides_status_requested_at ON rides (status, requested_at DESC);

-- Rider trip history.
CREATE INDEX idx_rides_rider_requested_at ON rides (rider_id, requested_at DESC);

-- "What is this driver currently on?"
CREATE INDEX idx_rides_driver_status ON rides (driver_id, status);

CREATE INDEX idx_drivers_status ON drivers (status);

CREATE INDEX idx_ride_status_history_ride ON ride_status_history (ride_id, changed_at);

-- One ACTIVE ride per rider. Partial, so finished rides do not block new ones.
CREATE UNIQUE INDEX uq_rides_active_per_rider
    ON rides (rider_id)
    WHERE status NOT IN ('COMPLETED', 'CANCELLED');

-- Same for drivers. driver_id is NULL while a ride is still unmatched.
CREATE UNIQUE INDEX uq_rides_active_per_driver
    ON rides (driver_id)
    WHERE driver_id IS NOT NULL
      AND status NOT IN ('COMPLETED', 'CANCELLED');
