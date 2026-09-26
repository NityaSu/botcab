import { useEffect, useRef, type MouseEvent } from "react";
import { latLngToSvg, svgToLatLng } from "../lib/geo";

export type MapPickMode = "pickup" | "dropoff" | null;

type Props = {
  showDrop: boolean;
  carVisible: boolean;
  /** 0..1 along the route path */
  carT: number;
  redisHint?: string;
  pickMode?: MapPickMode;
  pickup?: { lat: number; lng: number } | null;
  dropoff?: { lat: number; lng: number } | null;
  onMapPick?: (lat: number, lng: number) => void;
};

const ROUTE =
  "M140 320 C 200 320, 210 260, 260 250 S 330 230, 350 190 S 420 150, 470 110";

export function LiveMap({
  showDrop,
  carVisible,
  carT,
  redisHint,
  pickMode = null,
  pickup = null,
  dropoff = null,
  onMapPick,
}: Props) {
  const routeRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const route = routeRef.current;
    const car = carRef.current;
    if (!route || !car) return;
    const len = route.getTotalLength();
    const p = route.getPointAtLength(len * carT);
    car.setAttribute("transform", `translate(${p.x},${p.y})`);
  }, [carT, carVisible]);

  function handleClick(e: MouseEvent<SVGSVGElement>) {
    if (!pickMode || !onMapPick || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const { lat, lng } = svgToLatLng(local.x, local.y);
    onMapPick(lat, lng);
  }

  const pickupSvg = pickup ? latLngToSvg(pickup.lat, pickup.lng) : null;
  const dropoffSvg = dropoff ? latLngToSvg(dropoff.lat, dropoff.lng) : null;

  return (
    <div className={`bc-map-wrap${pickMode ? " is-picking" : ""}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 600 400"
        className="bc-map"
        onClick={handleClick}
        role={pickMode ? "button" : "img"}
        aria-label={pickMode ? `Tap map to set ${pickMode}` : "Live map"}
      >
        <g
          stroke="color-mix(in srgb, var(--bc-q) 45%, transparent)"
          strokeWidth="1.5"
          fill="none"
        >
          <path d="M0 80 H600 M0 170 H600 M0 260 H600 M0 340 H600" />
          <path d="M90 0 V400 M210 0 V400 M330 0 V400 M450 0 V400 M540 0 V400" />
        </g>
        <g
          stroke="color-mix(in srgb, var(--bc-q) 25%, transparent)"
          strokeWidth="3"
          fill="none"
        >
          <path d="M0 120 H600 M0 300 H600 M150 0 V400 M390 0 V400 M500 0 V400" />
        </g>
        <g fill="color-mix(in srgb, var(--bc-q) 9%, transparent)">
          <rect x="20" y="20" width="55" height="45" rx="6" />
          <rect x="230" y="30" width="80" height="60" rx="6" />
          <rect x="350" y="190" width="60" height="50" rx="6" />
          <rect x="100" y="280" width="90" height="45" rx="6" />
          <rect x="460" y="290" width="110" height="70" rx="6" />
          <rect x="410" y="30" width="70" height="60" rx="6" />
          <rect x="30" y="190" width="50" height="50" rx="6" />
          <rect x="230" y="280" width="80" height="45" rx="6" />
        </g>
        <rect
          x="480"
          y="140"
          width="100"
          height="130"
          rx="10"
          fill="color-mix(in srgb, var(--bc-pos) 9%, transparent)"
        />
        <text
          x="530"
          y="210"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="var(--bc-ter)"
        >
          Wat Phnom
        </text>
        <path
          ref={routeRef}
          d={ROUTE}
          fill="none"
          stroke="var(--bc-pri)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity={pickupSvg && dropoffSvg ? 0.35 : 0.85}
        />
        {pickupSvg && (
          <g>
            <circle cx={pickupSvg.x} cy={pickupSvg.y} r="7" fill="var(--bc-pos)" />
            <circle
              cx={pickupSvg.x}
              cy={pickupSvg.y}
              r="7"
              fill="none"
              stroke="var(--bc-pos)"
              strokeWidth="2"
              className="bc-pulse"
            />
            <text
              x={pickupSvg.x}
              y={pickupSvg.y - 12}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="var(--bc-pos)"
            >
              A
            </text>
          </g>
        )}
        {dropoffSvg && showDrop && (
          <g opacity={1}>
            <circle cx={dropoffSvg.x} cy={dropoffSvg.y} r="11" fill="var(--bc-pri)" />
            <text
              x={dropoffSvg.x}
              y={dropoffSvg.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="var(--bc-ink)"
              fontWeight="700"
            >
              B
            </text>
          </g>
        )}
        {!pickupSvg && (
          <g>
            <circle cx="140" cy="320" r="6" fill="var(--bc-pos)" />
            <circle
              cx="140"
              cy="320"
              r="6"
              fill="none"
              stroke="var(--bc-pos)"
              strokeWidth="2"
              className="bc-pulse"
            />
          </g>
        )}
        <g ref={carRef} opacity={carVisible ? 1 : 0}>
          <rect x="-14" y="-9" width="28" height="18" rx="6" fill="var(--bc-pri)" />
          <rect x="-8" y="-5" width="10" height="10" rx="2.5" fill="var(--bc-ink)" opacity=".9" />
          <circle cx="8" cy="0" r="2.2" fill="var(--bc-pos)" />
        </g>
      </svg>
      <div className="bc-chip bc-map-live">
        <span className="bc-dot" />
        {pickMode === "pickup"
          ? "Tap map · set pickup"
          : pickMode === "dropoff"
            ? "Tap map · set dropoff"
            : "Live map"}
      </div>
      <div className="bc-redis">{redisHint ?? "redis> GEOSEARCH drivers +500m → online"}</div>
    </div>
  );
}
