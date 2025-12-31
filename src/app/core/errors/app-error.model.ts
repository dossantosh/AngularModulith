import { ApiError } from './api-error.model';

export interface AppError {
  status: number;
  title: string;       // e.g. "Unauthorized"
  message: string;     // user-friendly main message
  path?: string;
  details?: string[];
  raw?: unknown;       // original error payload (debug/logging)
  backend?: ApiError;  // if it matched your backend contract
}
