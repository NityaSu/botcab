# BotCab

Ride-booking platform (Uber / Bolt shape). One Spring Boot **modular monolith**; `/web` is a tiny driver-sim until booking APIs exist.

A rider requests pickup and dropoff. The system matches a nearby driver, offers the trip with a short accept window, then tracks **requested → matched → driver en route → in progress → completed** (or cancelled). Fares come later; payments stay mocked.

| | |
|---|---|
| **Shape** | Modular monolith — not microservices |
| **Now** | Phase 3 done: STOMP offers + 15s accept. No `POST /rides` yet |
| **IDs** | `BIGINT GENERATED ALWAYS AS IDENTITY` |

## Stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.4 (Web, Data JPA, Validation, WebSocket) |
| DB | PostgreSQL 16, Flyway |
| Location | Redis 7 GEO + Redisson locks |
| Realtime | STOMP over `/ws` (in-memory broker) |
| Later | Spring Security, broker relay for multi-instance |
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

Open `http://localhost:5173`. Demo drivers are ids **1, 2, 3**.

1. Wait until WS shows **connected**
2. Go available → Ping location
3. **Request offer** — offer appears over STOMP with a 15s countdown
4. Accept, or wait / Reject to see reassignment to another pinged driver

Postgres: `localhost:5432`, database / user / password `botcab`. Redis: `localhost:6380`.
