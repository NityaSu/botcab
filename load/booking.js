import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Login as demo rider, book, then cancel (JWT).
 * Prep: driver 1 available + pinged; demo rider phone +855000000101 / password demo.
 */
const BASE = __ENV.BASE_URL || "http://localhost:8080";
const DRIVER_ID = Number(__ENV.DRIVER_ID || 1);
const RIDER_PHONE = __ENV.RIDER_PHONE || "+855000000101";
const RIDER_PASSWORD = __ENV.RIDER_PASSWORD || "demo";
const PNH = { lat: 11.5564, lng: 104.9282 };

export const options = {
  vus: 1,
  iterations: 20,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.9"],
  },
};

export function setup() {
  http.post(`${BASE}/api/drivers/${DRIVER_ID}/available`);
  const ping = http.post(
    `${BASE}/api/drivers/${DRIVER_ID}/location`,
    JSON.stringify({ lat: PNH.lat, lng: PNH.lng }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(ping, { "setup ping ok": (r) => r.status === 204 || r.status === 200 });

  const login = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ phone: RIDER_PHONE, password: RIDER_PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(login, { "login 200": (r) => r.status === 200 });
  const token = login.status === 200 ? JSON.parse(login.body).token : null;
  return { token };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  http.post(`${BASE}/api/drivers/${DRIVER_ID}/available`);
  http.post(
    `${BASE}/api/drivers/${DRIVER_ID}/location`,
    JSON.stringify({ lat: PNH.lat, lng: PNH.lng }),
    { headers: { "Content-Type": "application/json" } }
  );

  const book = http.post(
    `${BASE}/api/rides`,
    JSON.stringify({
      pickupLat: PNH.lat,
      pickupLng: PNH.lng,
      dropoffLat: PNH.lat + 0.01,
      dropoffLng: PNH.lng + 0.01,
    }),
    { headers }
  );

  const booked = check(book, {
    "book 200": (r) => r.status === 200,
  });

  if (!booked) {
    sleep(1);
    return;
  }

  const body = JSON.parse(book.body);
  const rideId = body.id;

  if (body.offer && body.offer.driverId === DRIVER_ID) {
    http.post(
      `${BASE}/api/rides/${rideId}/accept`,
      JSON.stringify({ driverId: DRIVER_ID }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const cancel = http.post(`${BASE}/api/rides/${rideId}/cancel`, null, { headers });
  check(cancel, {
    "cancel 200": (r) => r.status === 200,
  });

  sleep(0.3);
}
