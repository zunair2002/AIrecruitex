/**
 * Thin fetch wrapper around the Airecruitx backend.
 *
 * The backend always answers with `{ success: boolean, ... }`:
 * success -> { success: true, data: <payload> } (or { success: true, message })
 * failure -> { success: false, message: <reason> }
 * so every caller here gets either the unwrapped `data` or an ApiError.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Why a request was rejected as unauthenticated.
 *
 * "deactivated" is reported separately because it is not a dead token — the
 * account exists and the password still works, an admin has simply switched it
 * off. The UI says so rather than silently bouncing to the login page, where
 * the user would just be told their credentials are wrong.
 */
export type AuthFailure = "deactivated" | "unauthenticated";

type AuthFailureListener = (failure: AuthFailure) => void;

const authFailureListeners = new Set<AuthFailureListener>();

/**
 * Subscribe to auth rejections coming back from any request. Used by
 * AuthProvider so one 401/403 anywhere tears the session down everywhere,
 * instead of each screen rendering its own broken state.
 */
export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener);
  return () => authFailureListeners.delete(listener);
}

function reportAuthFailure(status: number, message: string): void {
  if (status !== 401 && status !== 403) return;
  // The backend's wording for this is "Account is deactivated" (auth.middleware
  // and auth.service both use it). 403 is also used for ordinary permission
  // errors, so match on the reason rather than the status alone.
  const isDeactivated = /deactivat/i.test(message);
  if (status === 403 && !isDeactivated) return;

  const failure: AuthFailure = isDeactivated
    ? "deactivated"
    : "unauthenticated";
  for (const listener of authFailureListeners) listener(failure);
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
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
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
    const message =
      payload?.message ?? `Request failed with status ${response.status}`;
    reportAuthFailure(response.status, message);
    throw new ApiError(message, response.status);
  }

  // Unwrap `data` when the envelope carries it — testing for the KEY, not its
  // value, because `data: null` is a legitimate answer ("no resume on file",
  // "no question pool yet"). Using `??` here would skip over a null `data` and
  // hand back the whole envelope, which then looks like a truthy object to the
  // caller and blows up on the first property access.
  //
  // Endpoints that answer `{ success, message }` with no `data` key at all
  // (deletes, logout) still fall back to the envelope so callers read `message`.
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

/** The HTTP status behind a thrown error, or 0 when it wasn't an API error. */
export function apiErrorStatus(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
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
