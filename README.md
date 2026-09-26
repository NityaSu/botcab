# BotCab

Ride-booking platform (Uber / Bolt shape). One Spring Boot **modular monolith**; `/web` is a Publix-style console split into Rider and Driver apps.

A rider requests pickup and dropoff. The system matches a nearby driver, offers the trip with a short accept window, then tracks **requested → matched → driver en route → in progress → completed** (or cancelled). Fares in KHR; payments stay mocked.

| | |
|---|---|
| **Shape** | Modular monolith — not microservices |
| **Now** | Phase 15 done: live driver location over WebSocket |
| **IDs** | `BIGINT GENERATED ALWAYS AS IDENTITY` |

## Stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.4 (Web, Data JPA, Validation, WebSocket, Actuator, Security) |
| DB | PostgreSQL 16, Flyway |
| Location | Redis 7 GEO + Redisson locks |
| Realtime | STOMP over `/ws` (JWT CONNECT; driver `/user/queue/offers`) |
| Load | k6 scripts in `/load` |
| Deploy | Docker Compose locally; Render Blueprint / Railway |
| Frontend | React 19 + Vite + TypeScript in `/web` |

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

Open `http://localhost:5173`:

- `/` — pick Rider or Driver
- `/rider` — demo `+855000000101` / `Demo1234`
- `/driver` — demo `+855000000011` / `Demo1234`

Tip: open Rider and Driver in two tabs to run a full trip.

## Run (full stack in Docker — Phase 7)

```bash
docker compose up --build
```

Then:

```bash
curl -s http://localhost:8080/actuator/health
```

Postgres / Redis / the Spring app all run as Compose services. Config is env-driven (`SPRING_DATASOURCE_*`, `SPRING_DATA_REDIS_*`, `BOTCAB_JWT_SECRET`). See `.env.example`.

### Observability (Phase 6)

```bash
curl -s http://localhost:8080/actuator/health
curl -s http://localhost:8080/actuator/prometheus | head
k6 run load/smoke.js
k6 run load/booking.js
```

See `load/README.md`.

Postgres: `localhost:5432`, database / user / password `botcab`. Redis: `localhost:6380` from the host (`redis:6379` inside Compose).
