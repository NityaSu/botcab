import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import type { OfferMessage } from "../api/types";

function wsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

export function useDriverOffers(
  driverId: number,
  enabled: boolean,
  onOffer: (offer: OfferMessage) => void,
) {
  const [connected, setConnected] = useState(false);
  const onOfferRef = useRef(onOffer);
  onOfferRef.current = onOffer;

  useEffect(() => {
    if (!enabled || !driverId) {
      setConnected(false);
      return;
    }

    let sub: StompSubscription | undefined;
    const client = new Client({
      brokerURL: wsUrl(),
      reconnectDelay: 2000,
      onConnect: () => {
        setConnected(true);
        sub = client.subscribe(`/topic/drivers/${driverId}/offers`, (msg: IMessage) => {
          try {
            const offer = JSON.parse(msg.body) as OfferMessage;
            onOfferRef.current(offer);
          } catch {
            /* ignore bad payloads */
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
  }, [driverId, enabled]);

  return { connected };
}
