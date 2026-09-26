import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type GeoJSONSource,
  type MapMouseEvent,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchDrivingRoute, pointAlongRoute } from "../lib/routing";

export type MapPickMode = "pickup" | "dropoff" | null;

type LatLng = { lat: number; lng: number };

type Props = {
  showDrop: boolean;
  carVisible: boolean;
  /** Fallback 0..1 along the route when no live GPS yet */
  carT?: number;
  /** Live driver GPS from STOMP (Phase 15) — preferred over carT */
  driverPosition?: LatLng | null;
  redisHint?: string;
  pickMode?: MapPickMode;
  pickup?: LatLng | null;
  dropoff?: LatLng | null;
  onMapPick?: (lat: number, lng: number) => void;
  /** Optional: receive road distance when OSRM returns a route */
  onRouteDistanceKm?: (km: number | null) => void;
};

const PNH: LatLng = { lat: 11.5564, lng: 104.928 };
const STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ROUTE_SOURCE = "botcab-route";
const ROUTE_LAYER = "botcab-route-line";

function makePinEl(label: string, kind: "a" | "b"): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `bc-map-pin bc-map-pin-${kind}`;
  const span = document.createElement("span");
  span.textContent = label;
  el.appendChild(span);
  return el;
}

function makeCarEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "bc-map-car";
  el.setAttribute("aria-hidden", "true");
  return el;
}

export function LiveMap({
  showDrop,
  carVisible,
  carT = 0.12,
  driverPosition = null,
  redisHint,
  pickMode = null,
  pickup = null,
  dropoff = null,
  onMapPick,
  onRouteDistanceKm,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pickupMarkerRef = useRef<Marker | null>(null);
  const dropoffMarkerRef = useRef<Marker | null>(null);
  const carMarkerRef = useRef<Marker | null>(null);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const pickModeRef = useRef(pickMode);
  const onMapPickRef = useRef(onMapPick);
  const onRouteDistanceKmRef = useRef(onRouteDistanceKm);
  const [routeTick, setRouteTick] = useState(0);

  pickModeRef.current = pickMode;
  onMapPickRef.current = onMapPick;
  onRouteDistanceKmRef.current = onRouteDistanceKm;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE,
      center: [PNH.lng, PNH.lat],
      zoom: 12,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.resize();
      if (!map.getSource(ROUTE_SOURCE)) {
        map.addSource(ROUTE_SOURCE, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: ROUTE_LAYER,
          type: "line",
          source: ROUTE_SOURCE,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#3ecf8e",
            "line-width": 4,
            "line-opacity": 0.9,
          },
        });
      }
    });

    map.on("click", (e: MapMouseEvent) => {
      if (!pickModeRef.current || !onMapPickRef.current) return;
      onMapPickRef.current(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      pickupMarkerRef.current?.remove();
      dropoffMarkerRef.current?.remove();
      carMarkerRef.current?.remove();
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      carMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = pickMode ? "crosshair" : "";
  }, [pickMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const ensureMarker = (
      ref: { current: Marker | null },
      point: LatLng | null | undefined,
      factory: () => HTMLDivElement,
    ) => {
      if (!point) {
        ref.current?.remove();
        ref.current = null;
        return;
      }
      if (!ref.current) {
        ref.current = new Marker({ element: factory(), anchor: "center" })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
      } else {
        ref.current.setLngLat([point.lng, point.lat]);
      }
    };

    ensureMarker(pickupMarkerRef, pickup, () => makePinEl("A", "a"));
    ensureMarker(dropoffMarkerRef, showDrop ? dropoff : null, () => makePinEl("B", "b"));

    let cancelled = false;
    const ac = new AbortController();

    function setRouteLine(coordinates: [number, number][]) {
      const m = mapRef.current;
      if (!m) return;
      const apply = () => {
        const source = m.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
        if (!source) {
          m.once("load", apply);
          return;
        }
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        });
      };
      apply();
    }

    function fitTo(points: LatLng[]) {
      const m = mapRef.current;
      if (!m || points.length === 0) return;
      if (points.length === 1) {
        m.easeTo({ center: [points[0].lng, points[0].lat], zoom: 13, duration: 500 });
        return;
      }
      const bounds = new LngLatBounds(
        [points[0].lng, points[0].lat],
        [points[0].lng, points[0].lat],
      );
      for (const p of points) bounds.extend([p.lng, p.lat]);
      m.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 600 });
    }

    async function updateRoute() {
      if (!pickup || !dropoff || !showDrop) {
        routeCoordsRef.current = [];
        setRouteTick((n) => n + 1);
        onRouteDistanceKmRef.current?.(null);
        setRouteLine([]);
        if (pickup) fitTo([pickup]);
        return;
      }

      const result = await fetchDrivingRoute(pickup, dropoff, ac.signal);
      if (cancelled) return;
      if (!result) {
        const fallback: [number, number][] = [
          [pickup.lng, pickup.lat],
          [dropoff.lng, dropoff.lat],
        ];
        routeCoordsRef.current = fallback;
        setRouteTick((n) => n + 1);
        onRouteDistanceKmRef.current?.(null);
        setRouteLine(fallback);
        fitTo([pickup, dropoff]);
        return;
      }
      routeCoordsRef.current = result.coordinates;
      setRouteTick((n) => n + 1);
      onRouteDistanceKmRef.current?.(result.distanceKm);
      setRouteLine(result.coordinates);
      fitTo([pickup, dropoff]);
    }

    if (pickup && !dropoff) {
      fitTo([pickup]);
    }

    void updateRoute();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, showDrop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const live = driverPosition != null;
    const showCar = carVisible || live;
    if (!showCar) {
      carMarkerRef.current?.remove();
      carMarkerRef.current = null;
      return;
    }

    let lng: number;
    let lat: number;
    if (live) {
      lng = driverPosition.lng;
      lat = driverPosition.lat;
    } else if (routeCoordsRef.current.length >= 2) {
      [lng, lat] = pointAlongRoute(routeCoordsRef.current, carT);
    } else {
      carMarkerRef.current?.remove();
      carMarkerRef.current = null;
      return;
    }

    if (!carMarkerRef.current) {
      carMarkerRef.current = new Marker({ element: makeCarEl(), anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      carMarkerRef.current.setLngLat([lng, lat]);
    }
  }, [carVisible, carT, routeTick, driverPosition?.lat, driverPosition?.lng]);

  return (
    <div className={`bc-map-wrap${pickMode ? " is-picking" : ""}`}>
      <div ref={containerRef} className="bc-map bc-map-canvas" role="presentation" />
      <div className="bc-chip bc-map-live">
        <span className="bc-dot" />
        {pickMode === "pickup"
          ? "Tap map · set pickup"
          : pickMode === "dropoff"
            ? "Tap map · set dropoff"
            : "Live map"}
      </div>
      <div className="bc-redis">{redisHint ?? "OSRM route · OpenFreeMap tiles"}</div>
    </div>
  );
}
