'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Plus, Trash2, TrendingDown, Users, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface FunnelStep {
  event: string;
  name: string;
}

interface FunnelStepResult {
  step: number;
  name: string;
  event: string;
  users_count: number;
  completion_rate: number;
  drop_off_rate: number;
  avg_time_to_next: string | null;
}

interface FunnelResponse {
  steps: FunnelStepResult[];
  total_conversion_rate: number;
  total_users_entered: number;
  total_users_converted: number;
  average_completion_time: string | null;
  time_window: string;
}

// Common event templates
const EVENT_TEMPLATES = {
  'E-commerce': [
    { event: 'pageview', name: 'Visited Site' },
    { event: 'product_viewed', name: 'Viewed Product' },
    { event: 'add_to_cart', name: 'Added to Cart' },
    { event: 'purchase', name: 'Purchased' },
  ],
  'Signup Flow': [
    { event: 'pageview', name: 'Landing Page' },
    { event: 'signup', name: 'Signed Up' },
    { event: 'login', name: 'First Login' },
  ],
  'Engagement': [
    { event: 'pageview', name: 'Visited' },
    { event: 'click', name: 'Clicked' },
    { event: 'share', name: 'Shared' },
  ],
};

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'mh_live_bf947c81aa941e864d35a23fd3fe9252';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function FunnelsPage() {
  const [steps, setSteps] = useState<FunnelStep[]>([
    { event: 'pageview', name: 'Visited Site' },
    { event: 'product_viewed', name: 'Viewed Product' },
  ]);
  const [timeWindow, setTimeWindow] = useState('7d');
  const [stepOrder, setStepOrder] = useState<'strict' | 'any_order'>('strict');
  const [result, setResult] = useState<FunnelResponse | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: { steps: FunnelStep[]; time_window: string; step_order: string }) => {
      const response = await fetch(`${API_URL}/insights/funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate funnel');
      }

      const json = await response.json();
      return json.data as FunnelResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Funnel calculated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate funnel: ${error.message}`);
    },
  });

  const handleAddStep = () => {
    setSteps([...steps, { event: '', name: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) {
      toast.error('Funnel must have at least 2 steps');
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: 'event' | 'name', value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleLoadTemplate = (templateName: string) => {
    const template = EVENT_TEMPLATES[templateName as keyof typeof EVENT_TEMPLATES];
    if (template) {
      setSteps(template);
      toast.success(`Loaded ${templateName} template`);
    }
  };

  const handleCalculate = () => {
    // Validate
    const invalidSteps = steps.filter(s => !s.event.trim());
    if (invalidSteps.length > 0) {
      toast.error('All steps must have an event name');
      return;
    }

    if (steps.length < 2) {
      toast.error('Funnel must have at least 2 steps');
      return;
    }

    calculateMutation.mutate({
      steps,
      time_window: timeWindow,
      step_order: stepOrder,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Funnel Analysis</h1>
            </div>
            <p className="text-muted-foreground">
              Track user progression through multi-step conversion flows
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Builder */}
            <div className="space-y-6">
              {/* Funnel Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Build Funnel</CardTitle>
                  <CardDescription>
                    Define the steps users take in your conversion flow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Templates */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Quick Start Templates
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(EVENT_TEMPLATES).map((template) => (
                        <Button
                          key={template}
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          {template}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Funnel Steps</Label>
                    {steps.map((step, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-shrink-0 w-8 h-9 flex items-center justify-center bg-blue-600 text-white rounded font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Event name (e.g., pageview, signup)"
                            value={step.event}
                            onChange={(e) => handleStepChange(index, 'event', e.target.value)}
                          />
                          <Input
                            placeholder="Display name (optional)"
                            value={step.name}
                            onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                          />
                        </div>
                        {steps.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStep(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>

                  {/* Configuration */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="timeWindow">Time Window</Label>
                      <Select value={timeWindow} onValueChange={setTimeWindow}>
                        <SelectTrigger id="timeWindow">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">Last 24 hours</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="60d">Last 60 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stepOrder">Step Order</Label>
                      <Select value={stepOrder} onValueChange={(v) => setStepOrder(v as any)}>
                        <SelectTrigger id="stepOrder">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict Order</SelectItem>
                          <SelectItem value="any_order">Any Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Calculate Funnel
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {result ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Total Conversion</CardDescription>
                        <CardTitle className="text-3xl">
                          {result.total_conversion_rate.toFixed(2)}%
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {result.total_users_converted} of {result.total_users_entered} users
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Avg. Time to Convert</CardDescription>
                        <CardTitle className="text-2xl">
                          {result.average_completion_time || 'N/A'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          End-to-end completion
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Funnel Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Funnel Visualization</CardTitle>
                      <CardDescription>User progression through each step</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.steps.map((step, index) => {
                        const barWidth = (step.users_count / result.total_users_entered) * 100;
                        const isLastStep = index === result.steps.length - 1;
                        
                        return (
                          <div key={step.step} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">
                                  {step.step}
                                </span>
                                <span className="font-medium">{step.name}</span>
                              </div>
                              <span className="text-sm font-semibold">
                                {step.users_count.toLocaleString()}
                                <span className="text-muted-foreground ml-1">
                                  ({step.completion_rate.toFixed(1)}%)
                                </span>
                              </span>
                            </div>

                            {/* Bar */}
                            <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center px-3"
                                style={{ width: `${barWidth}%` }}
                              >
                                {barWidth > 15 && (
                                  <span className="text-white text-sm font-semibold">
                                    {step.users_count.toLocaleString()} users
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Drop-off indicator */}
                            {!isLastStep && step.drop_off_rate > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-red-500 font-medium">
                                  {step.drop_off_rate.toFixed(1)}% drop-off
                                </span>
                                {step.avg_time_to_next && (
                                  <span className="text-muted-foreground">
                                    · Avg. time to next: {step.avg_time_to_next}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <Card className="border-blue-600/50 bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg">📊 Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {result.steps.map((step, index) => {
                        if (index === 0) return null;
                        const prevStep = result.steps[index - 1];
                        if (step.drop_off_rate > 50) {
                          return (
                            <p key={step.step} className="text-yellow-400">
                              ⚠️ High drop-off ({step.drop_off_rate.toFixed(1)}%) from "{prevStep.name}" to "{step.name}"
                            </p>
                          );
                        }
                        return null;
                      })}
                      {result.total_conversion_rate < 5 && (
                        <p className="text-red-400">
                          🔴 Low overall conversion rate ({result.total_conversion_rate.toFixed(2)}%)
                        </p>
                      )}
                      {result.total_conversion_rate >= 10 && (
                        <p className="text-green-400">
                          🟢 Great conversion rate ({result.total_conversion_rate.toFixed(2)}%)!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="flex items-center justify-center h-96">
                  <CardContent className="text-center py-12">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Funnel Results</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your funnel steps and click "Calculate Funnel" to see results
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
