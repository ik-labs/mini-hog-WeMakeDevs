const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'mh_live_bf947c81aa941e864d35a23fd3fe9252';

export interface Event {
  event: string;
  distinct_id: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  session_id?: string;
  anonymous_id?: string;
}

export interface Trend {
  timestamp: string;
  count: number;
}

export interface TopEvent {
  event: string;
  count: number;
}

export interface ActiveUsers {
  dau: number;
  wau: number;
  mau: number;
}

export interface EventRecord {
  timestamp: string;
  event: string;
  distinct_id: string;
  anonymous_id?: string;
  properties?: Record<string, unknown>;
  context?: Record<string, unknown>;
  session_id?: string;
}

export interface EventsListResponse {
  events: EventRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QueryResult {
  question: string;
  sql: string;
  results: Record<string, unknown>[];
  insights: string;
  chartSuggestion: string;
  executionTime: number;
}

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description?: string;
  active: boolean;
  rolloutPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlagInput {
  key: string;
  name: string;
  description?: string;
  active?: boolean;
  rollout_percentage?: number;
}

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  active?: boolean;
  rollout_percentage?: number;
}

export interface FlagEvaluation {
  key: string;
  enabled: boolean;
  variant: string;
  reason: string;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Analytics endpoints
  async getTrends(params?: {
    event?: string;
    from?: string;
    to?: string;
    interval?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<Trend[]> {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const response = await this.request<{ success: boolean; data: { series: Trend[], total: number } }>(`/insights/trends?${searchParams}`);
    return response.data.series;
  }

  async getActiveUsers(): Promise<ActiveUsers> {
    const response = await this.request<{ success: boolean; data: ActiveUsers }>('/insights/active-users');
    return response.data;
  }

  async getTopEvents(limit = 10): Promise<TopEvent[]> {
    const response = await this.request<{ success: boolean; data: { events: TopEvent[], total_events: number } }>(`/insights/top-events?limit=${limit}`);
    return response.data.events;
  }

  async getEvents(params?: {
    page?: number;
    limit?: number;
    event_name?: string;
    distinct_id?: string;
    from?: string;
    to?: string;
    period?: string;
  }): Promise<EventsListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const response = await this.request<{ success: boolean; data: EventsListResponse }>(
      `/insights/events?${searchParams}`
    );
    return response.data;
  }

  // AI endpoints
  async queryNaturalLanguage(question: string): Promise<QueryResult> {
    const response = await this.request<{ success: boolean; data: QueryResult }>(
      '/ai/query',
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      }
    );
    return response.data;
  }

  // Feature Flags endpoints
  async getFlags(): Promise<FeatureFlag[]> {
    const response = await this.request<{ success: boolean; data: FeatureFlag[] }>('/flags');
    return response.data;
  }

  async getFlag(key: string): Promise<FeatureFlag> {
    const response = await this.request<{ success: boolean; data: FeatureFlag }>(`/flags/${key}`);
    return response.data;
  }

  async createFlag(flag: CreateFlagInput): Promise<FeatureFlag> {
    const response = await this.request<{ success: boolean; data: FeatureFlag }>('/flags', {
      method: 'POST',
      body: JSON.stringify(flag),
    });
    return response.data;
  }

  async updateFlag(key: string, updates: UpdateFlagInput): Promise<FeatureFlag> {
    const response = await this.request<{ success: boolean; data: FeatureFlag }>(`/flags/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteFlag(key: string): Promise<void> {
    await this.request<{ success: boolean; message: string }>(`/flags/${key}`, {
      method: 'DELETE',
    });
  }

  async evaluateFlag(key: string, distinctId: string): Promise<FlagEvaluation> {
    const response = await this.request<{ success: boolean; data: FlagEvaluation }>(
      `/ff?key=${encodeURIComponent(key)}&distinct_id=${encodeURIComponent(distinctId)}`
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health/healthz');
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_KEY);
