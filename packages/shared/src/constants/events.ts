/**
 * Standard event names
 */
export const STANDARD_EVENTS = {
  PAGE_VIEW: '$pageview',
  IDENTIFY: '$identify',
  ALIAS: '$alias',
  SCREEN: '$screen',
  CLICK: '$click',
  SUBMIT: '$submit',
  CHANGE: '$change',
} as const;

/**
 * Reserved property keys
 */
export const RESERVED_PROPERTIES = {
  DISTINCT_ID: 'distinct_id',
  ANONYMOUS_ID: 'anonymous_id',
  SESSION_ID: 'session_id',
  TIMESTAMP: 'timestamp',
  EVENT: 'event',
  PROPERTIES: 'properties',
  CONTEXT: 'context',
} as const;

/**
 * Context property keys
 */
export const CONTEXT_KEYS = {
  URL: 'url',
  REFERRER: 'referrer',
  TITLE: 'title',
  USER_AGENT: 'user_agent',
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content',
  SDK_VERSION: 'sdk_version',
  SDK_NAME: 'sdk_name',
} as const;

/**
 * SDK configuration
 */
export const SDK_CONFIG = {
  NAME: 'minihog-js',
  VERSION: '0.1.0',
  BATCH_SIZE: 10,
  BATCH_INTERVAL_MS: 10000, // 10 seconds
  MAX_QUEUE_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;
