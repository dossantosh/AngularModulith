export interface ApiError {
  status: number;
  error: string;
  message: string;
  path?: string;
  details?: string[];
  timestamp?: string;
}