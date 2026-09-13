# BotCab

Ride-booking learning project. One Spring Boot modular monolith (`com.botcab.*`) plus `/web` later.

## Stack

- Java 21, Spring Boot 3.4, PostgreSQL 16, Flyway
- IDs: `BIGINT GENERATED ALWAYS AS IDENTITY`
- Redis / WebSockets / React: later phases

## Run locally

```bash
docker compose up -d
# JDK 21 on PATH, then:
./mvnw spring-boot:run   # or: mvn spring-boot:run
```

Phase 1 is done when this starts and Flyway applies `V1__init.sql`.

## Phase 1 — you write these

Do **not** add REST controllers yet.

1. `src/main/resources/db/migration/V1__init.sql`
2. `src/main/java/com/botcab/ride/Ride.java`
3. `src/main/java/com/botcab/ride/RideStatus.java`
4. Optional: `RideStatusMachine.java`

Rules already locked: integer cents, enum as STRING, lat/lng `DECIMAL(9,6)`, one active ride per rider and per driver (partial unique indexes), no MySQL/PostGIS spatial indexes.
