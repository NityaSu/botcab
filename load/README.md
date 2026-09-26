# k6 load scripts for BotCab Phase 6.
#
# Install: https://grafana.com/docs/k6/latest/set-up/install-k6/
#   brew install k6
#
# App must be running (docker compose + ./mvnw spring-boot:run).
#
# Smoke (health + prometheus scrape):
#   k6 run load/smoke.js
#
# Booking loop (rider JWT book → driver JWT accept → rider cancel):
#   k6 run load/booking.js
#
# Demo phones: rider +855000000101 / Demo1234 · driver +855000000011 / Demo1234
#
# Optional base URL:
#   k6 run -e BASE_URL=http://localhost:8080 load/smoke.js
