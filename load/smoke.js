import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  vus: 5,
  duration: "20s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const health = http.get(`${BASE}/actuator/health`);
  check(health, {
    "health status 200": (r) => r.status === 200,
    "health up": (r) => {
      try {
        return JSON.parse(r.body).status === "UP";
      } catch (_) {
        return false;
      }
    },
  });

  const metrics = http.get(`${BASE}/actuator/prometheus`);
  check(metrics, {
    "prometheus status 200": (r) => r.status === 200,
    "prometheus has jvm": (r) => String(r.body).includes("jvm_"),
  });

  sleep(0.5);
}
