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
# Booking loop (book → cancel; keep VUs low — one active ride per rider):
#   k6 run load/booking.js
#
# Optional base URL:
#   k6 run -e BASE_URL=http://localhost:8080 load/smoke.js
