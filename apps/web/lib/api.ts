const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export interface Event {
  event: string;
  distinct_id: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  session_id?: string;
  anonymous_id?: string;
}

export interface Trend {
  date: string;
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

export interface QueryResult {
  question: string;
  sql: string;
  results: unknown[];
  insights: string;
  chartSuggestion: string;
  executionTime: number;
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
    return this.request<Trend[]>(`/analytics/trends?${searchParams}`);
  }

  async getActiveUsers(): Promise<ActiveUsers> {
    return this.request<ActiveUsers>('/analytics/active-users');
  }

  async getTopEvents(limit = 10): Promise<TopEvent[]> {
    return this.request<TopEvent[]>(`/analytics/top-events?limit=${limit}`);
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

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health/healthz');
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_KEY);
