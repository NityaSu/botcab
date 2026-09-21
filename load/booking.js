import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Login as demo rider + driver, book, accept, then cancel (JWT roles).
 * Prep: demo rider +855000000101 / demo; demo driver +855000000011 / demo.
 */
const BASE = __ENV.BASE_URL || "http://localhost:8080";
const RIDER_PHONE = __ENV.RIDER_PHONE || "+855000000101";
const RIDER_PASSWORD = __ENV.RIDER_PASSWORD || "demo";
const DRIVER_PHONE = __ENV.DRIVER_PHONE || "+855000000011";
const DRIVER_PASSWORD = __ENV.DRIVER_PASSWORD || "demo";
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
  const riderLogin = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ phone: RIDER_PHONE, password: RIDER_PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(riderLogin, { "rider login 200": (r) => r.status === 200 });

  const driverLogin = http.post(
    `${BASE}/api/auth/drivers/login`,
    JSON.stringify({ phone: DRIVER_PHONE, password: DRIVER_PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(driverLogin, { "driver login 200": (r) => r.status === 200 });

  const riderToken = riderLogin.status === 200 ? JSON.parse(riderLogin.body).token : null;
  const driverToken = driverLogin.status === 200 ? JSON.parse(driverLogin.body).token : null;

  if (driverToken) {
    const dHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${driverToken}`,
    };
    http.post(`${BASE}/api/drivers/me/available`, null, { headers: dHeaders });
    const ping = http.post(
      `${BASE}/api/drivers/me/location`,
      JSON.stringify({ lat: PNH.lat, lng: PNH.lng }),
      { headers: dHeaders }
    );
    check(ping, { "setup ping ok": (r) => r.status === 204 || r.status === 200 });
  }

  return { riderToken, driverToken };
}

export default function (data) {
  const riderHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.riderToken}`,
  };
  const driverHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.driverToken}`,
  };

  http.post(`${BASE}/api/drivers/me/available`, null, { headers: driverHeaders });
  http.post(
    `${BASE}/api/drivers/me/location`,
    JSON.stringify({ lat: PNH.lat, lng: PNH.lng }),
    { headers: driverHeaders }
  );

  const book = http.post(
    `${BASE}/api/rides`,
    JSON.stringify({
      pickupLat: PNH.lat,
      pickupLng: PNH.lng,
      dropoffLat: PNH.lat + 0.01,
      dropoffLng: PNH.lng + 0.01,
    }),
    { headers: riderHeaders }
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

  if (body.offer) {
    http.post(`${BASE}/api/rides/${rideId}/accept`, null, { headers: driverHeaders });
  }

  const cancel = http.post(`${BASE}/api/rides/${rideId}/cancel`, null, { headers: riderHeaders });
  check(cancel, {
    "cancel 200": (r) => r.status === 200,
  });

  sleep(0.3);
}
