import { Injectable, Logger } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import { UAParser } from 'ua-parser-js';
import type {
  Event,
  BatchEventsRequest,
  Identify,
} from '@minihog/shared';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(private readonly duckdb: DuckDbService) {}

  /**
   * Process and ingest a batch of events
   */
  async ingestEvents(
    request: BatchEventsRequest,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ received: number; processed: number }> {
    const { events } = request;
    const received = events.length;
    let processed = 0;

    this.logger.debug(
      `Ingesting batch of ${received} events from IP: ${ipAddress}`,
    );

    for (const event of events) {
      try {
        const enrichedEvent = this.enrichEvent(event, userAgent, ipAddress);
        await this.duckdb.insertEvent({
          timestamp: new Date(enrichedEvent.timestamp || Date.now()),
          event: enrichedEvent.event,
          distinct_id: enrichedEvent.distinct_id,
          anonymous_id: enrichedEvent.anonymous_id,
          properties: enrichedEvent.properties,
          context: enrichedEvent.context,
          project_id: enrichedEvent.project_id || 'default',
          session_id: enrichedEvent.session_id,
        });
        processed++;
      } catch (error) {
        this.logger.error(
          `Failed to insert event: ${event.event}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log(`Successfully processed ${processed}/${received} events`);
    return { received, processed };
  }

  /**
   * Process identify event
   */
  async identify(
    identify: Identify,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const enrichedEvent = this.enrichEvent(
      {
        event: '$identify',
        distinct_id: identify.distinct_id,
        anonymous_id: identify.anonymous_id,
        timestamp: identify.timestamp,
        properties: identify.traits,
      },
      userAgent,
      ipAddress,
    );

    await this.duckdb.insertEvent({
      timestamp: new Date(enrichedEvent.timestamp || Date.now()),
      event: enrichedEvent.event,
      distinct_id: enrichedEvent.distinct_id,
      anonymous_id: enrichedEvent.anonymous_id,
      properties: enrichedEvent.properties,
      context: enrichedEvent.context,
      project_id: 'default',
    });

    this.logger.log(`Identified user: ${identify.distinct_id}`);
  }

  /**
   * Enrich event with additional context
   */
  private enrichEvent(
    event: Event,
    userAgent?: string,
    ipAddress?: string,
  ): Event {
    const enrichedContext: Record<string, unknown> = {
      ...event.context,
    };

    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }

    // Parse and add user-agent information
    if (userAgent) {
      const parser = new UAParser(userAgent);
      const parsed = parser.getResult();
      enrichedContext.user_agent = userAgent;
      
      // Add parsed UA details to context
      if (parsed.browser?.name) {
        enrichedContext.browser = parsed.browser.name;
        enrichedContext.browser_version = parsed.browser.version;
      }
      if (parsed.os?.name) {
        enrichedContext.os = parsed.os.name;
        enrichedContext.os_version = parsed.os.version;
      }
      if (parsed.device?.type) {
        enrichedContext.device_type = parsed.device.type;
      }
    }

    // Add IP address (hashed for privacy)
    if (ipAddress) {
      // Store hashed IP for privacy
      enrichedContext.ip_hash = this.hashIP(ipAddress);
    }

    // Add SDK information if not present
    if (!enrichedContext.sdk_name) {
      enrichedContext.sdk_name = 'unknown';
    }

    return {
      ...event,
      context: enrichedContext as Event['context'],
    };
  }

  /**
   * Hash IP address for privacy
   */
  private hashIP(ip: string): string {
    // Simple hash for privacy - in production use crypto
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get ingestion stats
   */
  async getStats(): Promise<{
    total_events: number;
    last_24h: number;
  }> {
    const totalResult = await this.duckdb.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM events',
    );

    const last24hResult = await this.duckdb.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM events WHERE received_at >= datetime('now', '-24 hours')",
    );

    return {
      total_events: totalResult[0]?.count || 0,
      last_24h: last24hResult[0]?.count || 0,
    };
  }
}
