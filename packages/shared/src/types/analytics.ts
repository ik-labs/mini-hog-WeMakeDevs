/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  count: number;
  value?: number;
}

/**
 * Trends response
 */
export interface TrendsResponse {
  event_name?: string;
  period: string;
  interval: string;
  series: TimeSeriesDataPoint[];
  total: number;
  breakdown?: {
    [key: string]: TimeSeriesDataPoint[];
  };
}

/**
 * Active users response
 */
export interface ActiveUsersResponse {
  dau: number;
  wau: number;
  mau: number;
  period: string;
  calculated_at: string;
}

/**
 * Top event
 */
export interface TopEvent {
  event: string;
  count: number;
  percentage: number;
}

/**
 * Top events response
 */
export interface TopEventsResponse {
  events: TopEvent[];
  total_events: number;
  period?: string;
}

/**
 * User timeline event
 */
export interface UserTimelineEvent {
  timestamp: string;
  event: string;
  properties?: Record<string, unknown>;
}

/**
 * User timeline response
 */
export interface UserTimelineResponse {
  distinct_id: string;
  events: UserTimelineEvent[];
  total: number;
}
