/**
 * Thin fetch wrapper around the Airecruitx backend.
 *
 * The backend always answers with `{ success: boolean, ... }`:
 *   success -> { success: true, data: <payload> }  (or { success: true, message })
 *   failure -> { success: false, message: <reason> }
 * so every caller here gets either the unwrapped `data` or an ApiError.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Values are dropped when `undefined`/`null`/`""` so filters stay optional. */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

type RequestOptions = {
  method?: HttpMethod;
  /** JSON body. Mutually exclusive with `formData`. */
  body?: unknown;
  /** Multipart body — Content-Type is left to the browser so the boundary is set. */
  formData?: FormData;
  query?: QueryParams;
  token?: string | null;
  signal?: AbortSignal;
};

export function buildQueryString(query: QueryParams | undefined): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, formData, query, token, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
      method,
      headers,
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
      0,
    );
  }

  let payload: { success?: boolean; message?: string; data?: T } | null = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (proxy error page, empty 204, ...) — fall through to the status check.
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  // Endpoints that answer `{ success, message }` with no `data` (deletes, logout)
  // fall back to the envelope itself so callers can still read `message`.
  return (payload?.data ?? payload) as T;
}

/** Turns a thrown value into something safe to render. */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";
}

/** True for the abort that `useEffect` cleanup triggers — never worth surfacing. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
