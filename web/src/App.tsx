import { FormEvent, useState } from "react";

const PNH = { lat: 11.5564, lng: 104.9282 };

async function post(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || res.statusText);
  }
  return text ? JSON.parse(text) : null;
}

export default function App() {
  const [driverId, setDriverId] = useState(1);
  const [driverLat, setDriverLat] = useState(PNH.lat);
  const [driverLng, setDriverLng] = useState(PNH.lng);
  const [pickupLat, setPickupLat] = useState(PNH.lat);
  const [pickupLng, setPickupLng] = useState(PNH.lng);
  const [log, setLog] = useState("Ping a driver near Phnom Penh, then search.");

  async function run(label: string, fn: () => Promise<unknown>) {
    try {
      const result = await fn();
      setLog(label + " OK " + (result ? JSON.stringify(result) : ""));
    } catch (e) {
      setLog(label + " FAIL " + (e instanceof Error ? e.message : String(e)));
    }
  }

  function onPing(e: FormEvent) {
    e.preventDefault();
    void run("ping", () =>
      post(`/api/drivers/${driverId}/location`, { lat: driverLat, lng: driverLng })
    );
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 520, margin: "2rem auto" }}>
      <h1>BotCab — driver sim</h1>
      <p>Phase 2: dump GPS into Redis GEO, then match the nearest unlocked driver.</p>

      <form onSubmit={onPing}>
        <h2>Driver ping</h2>
        <label>
          id{" "}
          <input
            type="number"
            min={1}
            value={driverId}
            onChange={(e) => setDriverId(Number(e.target.value))}
          />
        </label>
        <label>
          lat{" "}
          <input
            value={driverLat}
            onChange={(e) => setDriverLat(Number(e.target.value))}
          />
        </label>
        <label>
          lng{" "}
          <input
            value={driverLng}
            onChange={(e) => setDriverLng(Number(e.target.value))}
          />
        </label>
        <button type="submit">Ping location</button>
        <button
          type="button"
          onClick={() => run("available", () => post(`/api/drivers/${driverId}/available`))}
        >
          Go available
        </button>
        <button
          type="button"
          onClick={() => run("offline", () => post(`/api/drivers/${driverId}/offline`))}
        >
          Go offline
        </button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run("match", () =>
            post("/api/matching/search", { lat: pickupLat, lng: pickupLng })
          );
        }}
      >
        <h2>Match pickup</h2>
        <label>
          lat{" "}
          <input
            value={pickupLat}
            onChange={(e) => setPickupLat(Number(e.target.value))}
          />
        </label>
        <label>
          lng{" "}
          <input
            value={pickupLng}
            onChange={(e) => setPickupLng(Number(e.target.value))}
          />
        </label>
        <button type="submit">Find driver</button>
      </form>

      <pre style={{ background: "#111", color: "#eee", padding: "1rem", whiteSpace: "pre-wrap" }}>
        {log}
      </pre>
    </main>
  );
}
