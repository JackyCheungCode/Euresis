export type ApiSuccess<T> = { data: T; requestId?: string };
export type ApiFailure = { error: { code: string; message: string; details?: unknown }; requestId?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code = "API_ERROR", public readonly requestId?: string) {
    super(message); this.name = "ApiError";
  }
}
