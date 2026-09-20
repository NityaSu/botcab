import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Book then cancel so the rider stays free for the next iteration.
 * One active ride per rider — keep VUs at 1 (or the unique-index will 409).
 *
 * Prep: driver 1 available + pinged; rider id exists (demo rider, often id 2).
 */
const BASE = __ENV.BASE_URL || "http://localhost:8080";
const RIDER_ID = Number(__ENV.RIDER_ID || 2);
const DRIVER_ID = Number(__ENV.DRIVER_ID || 1);
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
  return {};
}

export default function () {
  const headers = { "Content-Type": "application/json" };

  // Ensure driver can be matched again after a prior busy state.
  http.post(`${BASE}/api/drivers/${DRIVER_ID}/available`);
  http.post(
    `${BASE}/api/drivers/${DRIVER_ID}/location`,
    JSON.stringify({ lat: PNH.lat, lng: PNH.lng }),
    { headers }
  );

  const book = http.post(
    `${BASE}/api/rides`,
    JSON.stringify({
      riderId: RIDER_ID,
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
      { headers }
    );
  }

  const cancel = http.post(
    `${BASE}/api/rides/${rideId}/cancel`,
    JSON.stringify({ cancelledBy: "RIDER", actorId: RIDER_ID }),
    { headers }
  );
  check(cancel, {
    "cancel 200": (r) => r.status === 200,
  });

  sleep(0.3);
}
