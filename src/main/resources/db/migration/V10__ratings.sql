-- One rating per ride per role (rider rates driver, driver rates rider). Stars 1–5.
CREATE TABLE ratings (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ride_id     BIGINT      NOT NULL REFERENCES rides (id),
    rater_role  VARCHAR(16) NOT NULL,
    stars       SMALLINT    NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ratings_stars_range CHECK (stars BETWEEN 1 AND 5),
    CONSTRAINT ratings_role_check CHECK (rater_role IN ('RIDER', 'DRIVER')),
    CONSTRAINT ux_ratings_ride_rater UNIQUE (ride_id, rater_role)
);

CREATE INDEX idx_ratings_ride_id ON ratings (ride_id);
