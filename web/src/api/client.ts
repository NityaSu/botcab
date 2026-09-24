export type TokenRole = "rider" | "driver";

const RIDER_KEY = "botcab.riderToken";
const DRIVER_KEY = "botcab.driverToken";

let activeRole: TokenRole = "rider";
let riderToken: string | null =
  typeof localStorage !== "undefined" ? localStorage.getItem(RIDER_KEY) : null;
let driverToken: string | null =
  typeof localStorage !== "undefined" ? localStorage.getItem(DRIVER_KEY) : null;

export function setActiveRole(role: TokenRole) {
  activeRole = role;
}

export function getToken(role: TokenRole = activeRole): string | null {
  return role === "rider" ? riderToken : driverToken;
}

export function setToken(role: TokenRole, token: string | null) {
  if (role === "rider") {
    riderToken = token;
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem(RIDER_KEY, token);
      else localStorage.removeItem(RIDER_KEY);
    }
  } else {
    driverToken = token;
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem(DRIVER_KEY, token);
      else localStorage.removeItem(DRIVER_KEY);
    }
  }
}

export type ApiErrorBody = {
  error?: string;
  code?: string;
  fields?: Record<string, string>;
};

export class ApiRequestError extends Error {
  readonly code?: string;
  readonly fields: Record<string, string>;

  constructor(message: string, code?: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.fields = fields ?? {};
  }
}

function formatError(json: ApiErrorBody, fallback: string): ApiRequestError {
  const fields = json.fields ?? {};
  const fieldMsg = Object.values(fields).filter(Boolean).join(" · ");
  const message = fieldMsg || json.error || fallback;
  return new ApiRequestError(message, json.code, fields);
}

async function request<T>(path: string, init?: RequestInit, role: TokenRole = activeRole): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = getToken(role);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    try {
      const json = JSON.parse(text) as ApiErrorBody;
      throw formatError(json, text || res.statusText);
    } catch (e) {
      if (e instanceof ApiRequestError) throw e;
      throw new ApiRequestError(text || res.statusText);
    }
  }
  return text ? (JSON.parse(text) as T) : (null as T);
}

export const api = {
  post: <T>(path: string, body?: unknown, role?: TokenRole) =>
    request<T>(
      path,
      {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      role,
    ),
  get: <T>(path: string, role?: TokenRole) => request<T>(path, undefined, role),
};
