/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    query_time_ms?: number;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  service: string;
  checks?: Record<string, 'ok' | 'failed'>;
}
