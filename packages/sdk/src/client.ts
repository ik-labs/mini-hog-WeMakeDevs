import type {
  MinihogConfig,
  EventProperties,
  UserTraits,
  PageProperties,
  MinihogEvent,
} from './types';

const SDK_VERSION = '0.1.0';

/**
 * Minihog Analytics Client
 */
export class MinihogClient {
  private config: Required<MinihogConfig>;
  private queue: MinihogEvent[] = [];
  private distinctId: string | null = null;
  private anonymousId: string;
  private sessionId: string;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: MinihogConfig) {
    // Validate required config
    if (!config.endpoint) {
      throw new Error('[Minihog] endpoint is required');
    }
    if (!config.apiKey) {
      throw new Error('[Minihog] apiKey is required');
    }

    this.config = {
      debug: false,
      maxBatchSize: 10,
      flushInterval: 10000,
      disableAutoPageTracking: false,
      ...config,
    };

    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionId = this.getOrCreateSessionId();

    this.log('Minihog initialized', {
      endpoint: this.config.endpoint,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
    });

    // Auto-track page view on init if enabled
    if (!this.config.disableAutoPageTracking) {
      this.page();
    }

    // Start flush timer
    this.startFlushTimer();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });
    }
  }

  /**
   * Track a custom event
   */
  track(event: string, properties?: EventProperties): void {
    const minihogEvent: MinihogEvent = {
      event,
      distinct_id: this.getDistinctId(),
      properties: {
        ...properties,
        $sdk_version: SDK_VERSION,
        $user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      anonymous_id: this.anonymousId,
    };

    this.enqueue(minihogEvent);
    this.log('Event tracked', minihogEvent as unknown as Record<string, unknown>);
  }

  /**
   * Track a page view
   */
  page(properties?: PageProperties): void {
    const utmParams = this.extractUtmParams();
    
    const pageProperties: PageProperties = {
      title: document.title,
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      ...utmParams,
      ...properties,
    };

    this.track('$pageview', pageProperties);
  }

  /**
   * Identify a user
   */
  identify(distinctId: string, traits?: UserTraits): void {
    this.distinctId = distinctId;
    
    // Store in localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('minihog_distinct_id', distinctId);
    }

    this.log('User identified', { distinctId, traits });

    // Track identify event
    this.track('$identify', traits);
  }

  /**
   * Manually flush the event queue
   */
  async flush(useBeacon = false): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    this.log('Flushing events', { count: events.length, useBeacon });

    try {
      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          `${this.config.endpoint}/e`,
          JSON.stringify({ events }),
        );
        if (!success) {
          this.log('sendBeacon failed, falling back to fetch', {}, 'warn');
          await this.sendViaFetch(events);
        }
      } else {
        await this.sendViaFetch(events);
      }
    } catch (error) {
      this.log('Failed to send events', { error }, 'error');
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }

  /**
   * Reset the client (clear user identification)
   */
  reset(): void {
    this.distinctId = null;
    this.anonymousId = this.generateUUID();
    this.sessionId = this.generateUUID();

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('minihog_distinct_id');
      localStorage.setItem('minihog_anonymous_id', this.anonymousId);
      localStorage.setItem('minihog_session_id', this.sessionId);
    }

    this.log('Client reset', {
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
    });
  }

  // Private methods

  private enqueue(event: MinihogEvent): void {
    this.queue.push(event);

    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush();
    }
  }

  private async sendViaFetch(events: MinihogEvent[], retryCount = 0): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    try {
      const response = await fetch(`${this.config.endpoint}/e`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        this.log(`Retry ${retryCount + 1}/${maxRetries} after ${delay}ms`, {}, 'warn');
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendViaFetch(events, retryCount + 1);
      }
      
      throw error;
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
      this.startFlushTimer();
    }, this.config.flushInterval);
  }

  private getDistinctId(): string {
    return this.distinctId || this.anonymousId;
  }

  private getOrCreateAnonymousId(): string {
    if (typeof localStorage === 'undefined') {
      return this.generateUUID();
    }

    let anonymousId = localStorage.getItem('minihog_anonymous_id');
    if (!anonymousId) {
      anonymousId = this.generateUUID();
      localStorage.setItem('minihog_anonymous_id', anonymousId);
    }

    return anonymousId;
  }

  private getOrCreateSessionId(): string {
    if (typeof localStorage === 'undefined') {
      return this.generateUUID();
    }

    let sessionId = localStorage.getItem('minihog_session_id');
    const lastActivity = localStorage.getItem('minihog_last_activity');
    const now = Date.now();

    // Session expires after 30 minutes of inactivity
    if (!sessionId || !lastActivity || now - parseInt(lastActivity) > 30 * 60 * 1000) {
      sessionId = this.generateUUID();
      localStorage.setItem('minihog_session_id', sessionId);
    }

    localStorage.setItem('minihog_last_activity', now.toString());

    return sessionId;
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private extractUtmParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ];

    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });

    return utmParams;
  }

  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log',
  ): void {
    if (!this.config.debug) return;

    const prefix = '[Minihog]';
    if (data) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }
}

/**
 * Factory function for creating a Minihog client instance
 */
export function init(config: MinihogConfig): MinihogClient {
  return new MinihogClient(config);
}
