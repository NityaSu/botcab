# BotCab

Ride-booking platform (Uber / Bolt shape). One Spring Boot **modular monolith**; a React app in `/web` comes when the booking APIs exist.

A rider requests pickup and dropoff. The system matches a nearby driver, offers the trip with a short accept window, then tracks **requested → matched → driver en route → in progress → completed** (or cancelled). Fares come later; payments stay mocked.

| | |
|---|---|
| **Shape** | Modular monolith — not microservices |
| **Now** | Phase 1 done: schema, ride entity, status machine. No HTTP yet |
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
| Later | Redis GEO + Redisson, STOMP WebSockets, Spring Security |
| Frontend | React 19 + Vite + TypeScript in `/web` (not yet) |
| Run | `docker compose` for Postgres |

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

Postgres: `localhost:5432`, database / user / password `botcab`.

Flyway applies `V1__init.sql` on startup. Hibernate `ddl-auto: validate` checks `Ride` against the `rides` table.
