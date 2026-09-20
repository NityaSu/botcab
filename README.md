# BotCab

Ride-booking platform (Uber / Bolt shape). One Spring Boot **modular monolith**; `/web` is a tiny driver-sim for the APIs just built.

A rider requests pickup and dropoff. The system matches a nearby driver, offers the trip with a short accept window, then tracks **requested → matched → driver en route → in progress → completed** (or cancelled). Fares come later; payments stay mocked.

| | |
|---|---|
| **Shape** | Modular monolith — not microservices |
| **Now** | Phase 7 in progress: Docker image + full-stack Compose |
| **IDs** | `BIGINT GENERATED ALWAYS AS IDENTITY` |

## Stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.4 (Web, Data JPA, Validation, WebSocket, Actuator) |
| DB | PostgreSQL 16, Flyway |
| Location | Redis 7 GEO + Redisson locks |
| Realtime | STOMP over `/ws` (in-memory broker) |
| Load | k6 scripts in `/load` |
| Deploy | Docker / Compose (Railway or Render later) |
| Frontend | React 19 + Vite + TypeScript in `/web` (driver-sim) |

## Packages

```
com.botcab.rider | driver | vehicle | ride | matching | payment | fare | common
```

Each feature owns its controller, service, and repository when those exist. Features call other **services** only.

## Run (local JVM)

Requires **JDK 21**.

```bash
docker compose up -d postgres redis
./mvnw spring-boot:run
```

In another terminal:

```bash
cd web && npm install && npm run dev
```

Open `http://localhost:5173`. Demo drivers are ids **1, 2, 3**; demo rider is often id **2** (check DB if book fails).

## Run (full stack in Docker — Phase 7)

```bash
docker compose up --build
```

Then:

```bash
curl -s http://localhost:8080/actuator/health
```

Postgres / Redis / the Spring app all run as Compose services. Config is env-driven (`SPRING_DATASOURCE_*`, `SPRING_DATA_REDIS_*`).

### Observability (Phase 6)

```bash
curl -s http://localhost:8080/actuator/health
curl -s http://localhost:8080/actuator/prometheus | head
k6 run load/smoke.js
k6 run -e RIDER_ID=2 load/booking.js
```

See `load/README.md`.

Postgres: `localhost:5432`, database / user / password `botcab`. Redis: `localhost:6380` from the host (`redis:6379` inside Compose).
