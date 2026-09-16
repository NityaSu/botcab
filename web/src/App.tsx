import { FormEvent, useEffect, useMemo, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";

const PNH = { lat: 11.5564, lng: 104.9282 };
const WS_URL = "ws://localhost:8080/ws";

type OfferMessage = {
  offerId: string;
  driverId: number;
  pickupLat: number;
  pickupLng: number;
  distanceKm: number;
  expiresAt: string;
  status: string;
  note: string;
};

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
  const [log, setLog] = useState("Connect WS, go available, ping, then request offer.");
  const [offer, setOffer] = useState<OfferMessage | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [wsState, setWsState] = useState("connecting…");

  async function run(label: string, fn: () => Promise<unknown>) {
    try {
      const result = await fn();
      setLog(label + " OK " + (result ? JSON.stringify(result) : ""));
      return result;
    } catch (e) {
      setLog(label + " FAIL " + (e instanceof Error ? e.message : String(e)));
      return null;
    }
  }

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 2000,
      onConnect: () => {
        setWsState("connected");
        client.subscribe(`/topic/drivers/${driverId}/offers`, (message: IMessage) => {
          const body = JSON.parse(message.body) as OfferMessage;
          setOffer(body);
          setLog("STOMP " + body.note + " " + JSON.stringify(body));
          if (body.status !== "PENDING") {
            setSecondsLeft(null);
          }
        });
      },
      onDisconnect: () => setWsState("disconnected"),
      onStompError: (frame) => setWsState("error: " + frame.headers["message"]),
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [driverId]);

  useEffect(() => {
    if (!offer || offer.status !== "PENDING") {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(offer.expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [offer]);

  const marker = useMemo(() => {
    if (!offer) {
      return { x: 50, y: 50 };
    }
    // Tiny fake map: Phnom Penh-ish box, pickup as pin
    const x = 20 + ((offer.pickupLng - 104.9) / 0.1) * 60;
    const y = 80 - ((offer.pickupLat - 11.5) / 0.1) * 60;
    return {
      x: Math.min(90, Math.max(10, x)),
      y: Math.min(90, Math.max(10, y)),
    };
  }, [offer]);

  function onPing(e: FormEvent) {
    e.preventDefault();
    void run("ping", () =>
      post(`/api/drivers/${driverId}/location`, { lat: driverLat, lng: driverLng })
    );
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "2rem auto" }}>
      <h1>BotCab — driver sim</h1>
      <p>
        Phase 3: STOMP offer + 15s accept. WS: <strong>{wsState}</strong> (driver topic{" "}
        <code>/topic/drivers/{driverId}/offers</code>)
      </p>

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
          void run("offer", async () => {
            const msg = (await post("/api/offers/request", {
              lat: pickupLat,
              lng: pickupLng,
            })) as OfferMessage;
            setOffer(msg);
            return msg;
          });
        }}
      >
        <h2>Request offer (match + push)</h2>
        <label>
          pickup lat{" "}
          <input
            value={pickupLat}
            onChange={(e) => setPickupLat(Number(e.target.value))}
          />
        </label>
        <label>
          pickup lng{" "}
          <input
            value={pickupLng}
            onChange={(e) => setPickupLng(Number(e.target.value))}
          />
        </label>
        <button type="submit">Request offer</button>
      </form>

      {offer && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Live offer</h2>
          <p>
            {offer.status}
            {secondsLeft !== null ? ` · ${secondsLeft}s left` : ""} · driver {offer.driverId} ·{" "}
            {offer.distanceKm.toFixed(2)} km
          </p>
          <div
            style={{
              position: "relative",
              height: 180,
              background: "linear-gradient(160deg, #d9e7d2, #c5d4e8)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <span
              title="pickup"
              style={{
                position: "absolute",
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                width: 14,
                height: 14,
                margin: -7,
                borderRadius: "50%",
                background: "#c0392b",
                border: "2px solid #fff",
              }}
            />
            <span
              title="driver"
              style={{
                position: "absolute",
                left: "48%",
                top: "55%",
                width: 12,
                height: 12,
                margin: -6,
                borderRadius: 2,
                background: "#1a5276",
                border: "2px solid #fff",
              }}
            />
            <small style={{ position: "absolute", left: 8, bottom: 8, color: "#333" }}>
              Phnom Penh sketch · red = pickup · blue = you
            </small>
          </div>
          {offer.status === "PENDING" && offer.driverId === driverId && (
            <p style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                onClick={() =>
                  run("accept", () =>
                    post(`/api/offers/${offer.offerId}/accept`, { driverId })
                  )
                }
              >
                Accept
              </button>{" "}
              <button
                type="button"
                onClick={() =>
                  run("reject", () =>
                    post(`/api/offers/${offer.offerId}/reject`, { driverId })
                  )
                }
              >
                Reject
              </button>
            </p>
          )}
        </section>
      )}

      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: "1rem",
          whiteSpace: "pre-wrap",
          marginTop: "1.5rem",
        }}
      >
        {log}
      </pre>
    </main>
  );
}
