/**
 * Time period constants
 */
export const TIME_PERIODS = {
  ONE_HOUR: '1h',
  SIX_HOURS: '6h',
  TWELVE_HOURS: '12h',
  ONE_DAY: '24h',
  SEVEN_DAYS: '7d',
  FOURTEEN_DAYS: '14d',
  THIRTY_DAYS: '30d',
  SIXTY_DAYS: '60d',
  NINETY_DAYS: '90d',
  ALL: 'all',
} as const;

/**
 * Time interval constants
 */
export const TIME_INTERVALS = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;

/**
 * Time period to milliseconds mapping
 */
export const TIME_PERIOD_MS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '60d': 60 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};
