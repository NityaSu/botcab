type IconProps = { size?: number; className?: string };

export function CabIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
      <circle cx="7.5" cy="17" r="1.6" />
      <circle cx="16.5" cy="17" r="1.6" />
      <path d="M9.5 7.2l-1 3.3h7l-1-3.3" />
    </svg>
  );
}

export function SearchIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.5 3C16.19 3 20 6.81 20 11.5c0 2.02-.71 3.88-1.89 5.34l3.02 3.02a1.5 1.5 0 0 1-2.12 2.12l-3.02-3.02A8.44 8.44 0 0 1 11.5 20C6.81 20 3 16.19 3 11.5S6.81 3 11.5 3zm0 2.8a5.7 5.7 0 1 0 0 11.4 5.7 5.7 0 0 0 0-11.4z" />
    </svg>
  );
}

export function PinIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--bc-ter)" aria-hidden>
      <path d="M12 2.1a9 9 0 0 1 9 9c0 2.28-1.19 4.38-2.71 6.1-1.52 1.73-3.25 3-4.12 3.57a.9.9 0 0 1-1.04 0c-.87-.57-2.6-1.84-4.12-3.57A10.9 10.9 0 0 1 3 11.1a9 9 0 0 1 9-9zm0 6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z" />
    </svg>
  );
}

export function StarIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--bc-pri)" aria-hidden>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

export function CheckIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--bc-pos)" aria-hidden>
      <path d="M19.3 5.9a1.5 1.5 0 0 1 2.12 2.12L9.66 18.1a1.5 1.5 0 0 1-2.12 0l-4.97-4.97a1.5 1.5 0 1 1 2.12-2.12l3.33 3.32L19.3 5.9z" />
    </svg>
  );
}
