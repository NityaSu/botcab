import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { getToken, type TokenRole } from "../api/client";
import { isDriverLocationMessage, type DriverLocationMessage } from "../api/types";

function wsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

/**
 * Subscribe to live driver GPS on `/topic/rides/{rideId}` (JWT CONNECT).
 * Filters for `{ event: "location", lat, lng }` payloads.
 */
export function useRideLocation(
  rideId: number | null,
  role: TokenRole,
  enabled: boolean,
) {
  const [position, setPosition] = useState<DriverLocationMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const latestRideRef = useRef(rideId);
  latestRideRef.current = rideId;

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
    }
  }, [enabled, rideId]);

  useEffect(() => {
    const token = getToken(role);
    if (!enabled || !rideId || !token) {
      setConnected(false);
      return;
    }

    let sub: StompSubscription | undefined;
    const client = new Client({
      brokerURL: wsUrl(),
      reconnectDelay: 2000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        sub = client.subscribe(`/topic/rides/${rideId}`, (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as unknown;
            if (!isDriverLocationMessage(body)) return;
            if (body.rideId !== latestRideRef.current) return;
            setPosition(body);
          } catch {
            /* ignore */
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    return () => {
      sub?.unsubscribe();
      void client.deactivate();
      setConnected(false);
    };
  }, [rideId, role, enabled]);

  return { position, connected };
}
