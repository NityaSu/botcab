export type DriverPhase =
  | "idle"
  | "waiting"
  | "request"
  | "accepted"
  | "enroute"
  | "trip"
  | "done"
  | "expired"
  | "declined";
