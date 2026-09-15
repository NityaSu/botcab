# BotCab

Ride-booking platform (Uber / Bolt shape). One Spring Boot **modular monolith**; `/web` is a tiny driver-sim until booking APIs exist.

A rider requests pickup and dropoff. The system matches a nearby driver, offers the trip with a short accept window, then tracks **requested → matched → driver en route → in progress → completed** (or cancelled). Fares come later; payments stay mocked.

| | |
|---|---|
| **Shape** | Modular monolith — not microservices |
| **Now** | Phase 2 done: Redis GEO matching. No `POST /rides` yet |
| **IDs** | `BIGINT GENERATED ALWAYS AS IDENTITY` |

**Docs**

- [docs/GOAL.md](docs/GOAL.md) — product scope and success criteria
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — packages, state machine, data rules
- [docs/PHASES.md](docs/PHASES.md) — delivery phases and current status

## Stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.4 (Web, Data JPA, Validation) |
| DB | PostgreSQL 16, Flyway |
| Location | Redis 7 GEO + Redisson locks |
| Later | STOMP WebSockets, Spring Security |
| Frontend | React 19 + Vite + TypeScript in `/web` (driver-sim) |
| Run | `docker compose` for Postgres + Redis |

## Packages

```
com.botcab.rider | driver | vehicle | ride | matching | payment | fare | common
```

Each feature owns its controller, service, and repository when those exist. Features call other **services** only.

## Run

Requires **JDK 21**.

```bash
docker compose up -d
./mvnw spring-boot:run
```

In another terminal:

```bash
cd web && npm install && npm run dev
```

Open `http://localhost:5173`. Demo drivers are ids **1, 2, 3**. Ping a location (Phnom Penh defaults), then Find driver.

Postgres: `localhost:5432`, database / user / password `botcab`. Redis: `localhost:6380` (BotCab’s container; 6379 may already be in use on this machine).
