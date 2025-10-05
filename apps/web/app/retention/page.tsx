'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Calendar, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface RetentionPeriod {
  period: number;
  users: number;
  percentage: number;
}

interface CohortRetention {
  cohort_name: string;
  cohort_start: string;
  cohort_size: number;
  periods: RetentionPeriod[];
}

interface RetentionSummary {
  total_cohorts: number;
  avg_period1_retention: number | null;
  avg_period7_retention: number | null;
  avg_period30_retention: number | null;
  best_cohort: string | null;
  worst_cohort: string | null;
  total_users: number;
}

interface RetentionResponse {
  cohorts: CohortRetention[];
  summary: RetentionSummary;
  metadata: {
    cohort_type: string;
    period_type: string;
    periods_analyzed: number;
  };
}

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'mh_live_bf947c81aa941e864d35a23fd3fe9252';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Heatmap color scale
const getHeatColor = (percentage: number): string => {
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 50) return 'bg-lime-500';
  if (percentage >= 30) return 'bg-amber-500';
  if (percentage >= 10) return 'bg-orange-500';
  return 'bg-red-500';
};

const getTextColor = (percentage: number): string => {
  return percentage >= 10 ? 'text-white' : 'text-gray-400';
};

export default function RetentionPage() {
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [periods, setPeriods] = useState(8);
  const [dateRange, setDateRange] = useState('60d');
  const [result, setResult] = useState<RetentionResponse | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: {
      cohort_type: string;
      cohort_event: string;
      return_event: string;
      period_type: string;
      periods: number;
      date_range: string;
    }) => {
      const response = await fetch(`${API_URL}/insights/retention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate retention');
      }

      const json = await response.json();
      return json.data as RetentionResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Retention calculated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate retention: ${error.message}`);
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      cohort_type: 'first_event',
      cohort_event: 'pageview',
      return_event: 'any',
      period_type: periodType,
      periods,
      date_range: dateRange,
    });
  };

  const handleExportCSV = () => {
    if (!result) return;

    // Build CSV
    const headers = ['Cohort', 'Size', ...Array.from({ length: periods }, (_, i) => `Period ${i}`)];
    const rows = result.cohorts.map(cohort => [
      cohort.cohort_name,
      cohort.cohort_size.toString(),
      ...cohort.periods.map(p => `${p.percentage}%`),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-${periodType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  const getPeriodLabel = (period: number): string => {
    if (period === 0) return periodType === 'daily' ? 'D0' : periodType === 'weekly' ? 'W0' : 'M0';
    
    switch (periodType) {
      case 'daily':
        return `D${period}`;
      case 'weekly':
        return `W${period}`;
      case 'monthly':
        return `M${period}`;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Retention Analysis</h1>
            </div>
            <p className="text-muted-foreground">
              Track how cohorts of users return over time with interactive heatmaps
            </p>
          </div>

          {/* Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Select cohort and analysis parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodType">Period Type</Label>
                  <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                    <SelectTrigger id="periodType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periods">Periods to Show</Label>
                  <Select value={periods.toString()} onValueChange={(v) => setPeriods(Number(v))}>
                    <SelectTrigger id="periods">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 periods</SelectItem>
                      <SelectItem value="12">12 periods</SelectItem>
                      <SelectItem value="16">16 periods</SelectItem>
                      <SelectItem value="24">24 periods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="dateRange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="60d">Last 60 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                    className="w-full"
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Calculate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-3xl">{result.summary.total_users.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Across {result.summary.total_cohorts} cohorts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Period 1 Retention</CardDescription>
                    <CardTitle className="text-3xl">
                      {result.summary.avg_period1_retention?.toFixed(1) || 'N/A'}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Average across cohorts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Period 7 Retention</CardDescription>
                    <CardTitle className="text-3xl">
                      {result.summary.avg_period7_retention?.toFixed(1) || 'N/A'}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Long-term stickiness</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Best Cohort</CardDescription>
                    <CardTitle className="text-xl">{result.summary.best_cohort || 'N/A'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Highest retention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Cohort Retention Heatmap</CardTitle>
                      <CardDescription>
                        Percentage of users returning in each period
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      {/* Header Row */}
                      <div className="flex mb-2">
                        <div className="w-40 flex-shrink-0 font-semibold text-sm pr-4">
                          Cohort
                        </div>
                        <div className="w-20 flex-shrink-0 font-semibold text-sm text-center">
                          Size
                        </div>
                        {Array.from({ length: periods }, (_, i) => (
                          <div key={i} className="w-20 flex-shrink-0 font-semibold text-sm text-center">
                            {getPeriodLabel(i)}
                          </div>
                        ))}
                      </div>

                      {/* Cohort Rows */}
                      {result.cohorts.map((cohort, cohortIdx) => (
                        <div key={cohortIdx} className="flex mb-1 items-center">
                          <div className="w-40 flex-shrink-0 text-sm font-medium pr-4 truncate">
                            {cohort.cohort_name}
                          </div>
                          <div className="w-20 flex-shrink-0 text-sm text-center text-muted-foreground">
                            {cohort.cohort_size}
                          </div>
                          {cohort.periods.map((period, periodIdx) => {
                            const colorClass = getHeatColor(period.percentage);
                            const textColorClass = getTextColor(period.percentage);
                            
                            return (
                              <div
                                key={periodIdx}
                                className={`w-20 h-12 flex-shrink-0 flex items-center justify-center rounded ${colorClass} ${textColorClass} text-xs font-semibold cursor-help transition-transform hover:scale-105`}
                                title={`${cohort.cohort_name} - Period ${period.period}: ${period.users} users (${period.percentage}%)`}
                              >
                                {period.percentage > 0 ? `${period.percentage}%` : '-'}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex items-center gap-6 justify-center flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-green-500"></div>
                      <span className="text-sm">≥70% Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-lime-500"></div>
                      <span className="text-sm">50-70% Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-amber-500"></div>
                      <span className="text-sm">30-50% Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-orange-500"></div>
                      <span className="text-sm">10-30% Poor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-red-500"></div>
                      <span className="text-sm">&lt;10% Critical</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card className="border-blue-600 bg-gradient-to-br from-blue-950/40 to-indigo-950/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-100 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.summary.avg_period1_retention && result.summary.avg_period1_retention >= 60 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-900/30 border border-green-700/50">
                      <span className="text-2xl flex-shrink-0">🟢</span>
                      <p className="text-green-100 text-sm leading-relaxed">
                        <span className="font-semibold">Strong early retention ({result.summary.avg_period1_retention.toFixed(1)}%)</span> - Users are finding value quickly!
                      </p>
                    </div>
                  )}
                  
                  {result.summary.avg_period1_retention && result.summary.avg_period1_retention < 40 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-900/30 border border-yellow-700/50">
                      <span className="text-2xl flex-shrink-0">⚠️</span>
                      <p className="text-yellow-100 text-sm leading-relaxed">
                        <span className="font-semibold">Low early retention ({result.summary.avg_period1_retention.toFixed(1)}%)</span> - Focus on onboarding improvements
                      </p>
                    </div>
                  )}

                  {result.summary.avg_period7_retention && result.summary.avg_period7_retention >= 20 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-900/30 border border-blue-700/50">
                      <span className="text-2xl flex-shrink-0">✨</span>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        <span className="font-semibold">Good long-term retention ({result.summary.avg_period7_retention.toFixed(1)}%)</span> - Product has staying power
                      </p>
                    </div>
                  )}

                  {result.summary.best_cohort && result.summary.worst_cohort && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-900/30 border border-purple-700/50">
                      <span className="text-2xl flex-shrink-0">🔍</span>
                      <p className="text-purple-100 text-sm leading-relaxed">
                        Compare <span className="font-semibold">{result.summary.best_cohort}</span> (best) vs{' '}
                        <span className="font-semibold">{result.summary.worst_cohort}</span> (worst) to identify success patterns
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex items-center justify-center h-96">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Retention Data</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your analysis parameters and click "Calculate" to see cohort retention
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
