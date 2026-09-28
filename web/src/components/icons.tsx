type IconProps = { size?: number; className?: string };

function base(props: IconProps) {
  return {
    width: props.size ?? 24,
    height: props.size ?? 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: props.className,
    "aria-hidden": true,
  };
}

/** BotCab brand mark. */
export function CabIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base({ size, className })}>
      <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
      <circle cx="7.5" cy="17" r="1.6" />
      <circle cx="16.5" cy="17" r="1.6" />
      <path d="M9.5 7.2l-1 3.3h7l-1-3.3" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function StarIcon({ filled = true, size = 14, className }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <svg {...base({ size, className })} fill="currentColor" stroke="none">
        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
      </svg>
    );
  }
  return (
    <svg {...base({ size, className })}>
      <path d="M12 3.2 14.6 8.6l6 .9-4.3 4.2 1 5.8L12 16.6 6.7 19.5l1-5.8L3.4 9.5l6-.9z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <rect x="3" y="6" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M16.5 15h.01" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <path d="M3.5 12.5v-8a1 1 0 0 1 1-1h8L21 12l-8.5 8.5z" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <path d="M14 4h-8v16h8" />
      <path d="M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.14-1.4l2.1-1.63-2-3.46-2.48 1a7 7 0 0 0-2.42-1.4L13.7 2.5h-3.4l-.36 2.6a7 7 0 0 0-2.42 1.4l-2.48-1-2 3.46 2.1 1.63a7 7 0 0 0 0 2.8l-2.1 1.63 2 3.46 2.48-1a7 7 0 0 0 2.42 1.4l.36 2.6h3.4l.36-2.6a7 7 0 0 0 2.42-1.4l2.48 1 2-3.46-2.1-1.63c.09-.46.14-.93.14-1.4z" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

export function MotoIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M5.5 17h6l3-7h3M9 7h3l2 5" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M17.5 14.5a6.5 6.5 0 0 1 4 5.5" />
    </svg>
  );
}

export function SteeringIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props })}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 14.5V21M3.6 10l5.9 1.2M20.4 10l-5.9 1.2" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base({ size: 18, ...props })}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...base({ size: 20, ...props })}>
      <path d="M3.5 12a8.5 8.5 0 1 1 2.5 6" />
      <path d="M3.5 12H1m2.5 0H6M12 7.5V12l3 2" />
    </svg>
  );
}
