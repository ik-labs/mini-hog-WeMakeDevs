/**
 * Configuration options for initializing Minihog SDK
 */
export interface MinihogConfig {
  /** API endpoint URL (e.g., http://localhost:3000/api) */
  endpoint: string;
  /** API key for authentication */
  apiKey: string;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Maximum batch size before auto-flush (default: 10) */
  maxBatchSize?: number;
  /** Maximum time in ms before auto-flush (default: 10000) */
  flushInterval?: number;
  /** Disable automatic page tracking (default: false) */
  disableAutoPageTracking?: boolean;
}

/**
 * Event properties object
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * User traits/properties for identify calls
 */
export interface UserTraits {
  name?: string;
  email?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Internal event structure sent to backend
 */
export interface MinihogEvent {
  event: string;
  distinct_id: string;
  properties?: EventProperties;
  timestamp?: string;
  session_id?: string;
  anonymous_id?: string;
}

/**
 * Page properties
 */
export interface PageProperties {
  title?: string;
  url?: string;
  path?: string;
  referrer?: string;
  [key: string]: string | number | boolean | null | undefined;
}
