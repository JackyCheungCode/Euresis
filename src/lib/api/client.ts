import { ApiError, type ApiResponse } from "./types";
type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, { ...options, headers: { Accept: "application/json", ...(options.body === undefined ? {} : { "Content-Type": "application/json" }), ...options.headers }, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload || !("data" in payload)) {
    const failure = payload && "error" in payload ? payload.error : undefined;
    throw new ApiError(failure?.message ?? "The request could not be completed.", response.status, failure?.code, payload?.requestId);
  }
  return payload.data;
}
