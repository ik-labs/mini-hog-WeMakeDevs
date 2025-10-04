'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { apiClient, QueryResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sparkles, Clock, Database, TrendingUp, Loader2, History } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const EXAMPLE_QUESTIONS = [
  'How many events happened today?',
  'What are the top 5 events by count?',
  'How many unique users do we have?',
  'Show me events over the last 7 days',
  'What is the most popular event this week?',
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

interface QueryHistoryItem {
  question: string;
  timestamp: number;
}

export default function QueryPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  // Load query history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('queryHistory');
    if (stored) {
      try {
        setQueryHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse query history:', e);
      }
    }
  }, []);

  // Save query to history
  const saveToHistory = (question: string) => {
    const newHistory = [
      { question, timestamp: Date.now() },
      ...queryHistory.filter((item) => item.question !== question),
    ].slice(0, 5); // Keep only last 5 unique queries
    
    setQueryHistory(newHistory);
    localStorage.setItem('queryHistory', JSON.stringify(newHistory));
  };

  const mutation = useMutation({
    mutationFn: (question: string) => apiClient.queryNaturalLanguage(question),
    onSuccess: (data, variables) => {
      setResult(data);
      saveToHistory(variables);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      mutation.mutate(question);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
    mutation.mutate(exampleQuestion);
  };

  const handleHistoryClick = (historyQuestion: string) => {
    setQuestion(historyQuestion);
    mutation.mutate(historyQuestion);
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (question.trim()) {
          mutation.mutate(question);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, mutation]);

  const renderChart = () => {
    if (!result || !result.results || result.results.length === 0) return null;

    const chartType = result.chartSuggestion?.toLowerCase() || 'table';
    const data = result.results;

    // Prepare data for charts
    const chartData = data.map((row, index) => ({
      ...row,
      name: row.event || row.date || row.timestamp || row.distinct_id || `Item ${index + 1}`,
      value: row.count || row.total || row.value || 0,
    }));

    if (chartType.includes('line') || chartType.includes('trend')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType.includes('bar')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType.includes('pie')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">AI Query</h1>
            </div>
            <p className="text-muted-foreground">
              Ask questions in natural language. Powered by Cerebras + Llama 3.3
            </p>
          </div>

          {/* Query Input */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Use natural language to query your analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., How many users signed up last week?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 text-base"
                    disabled={mutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={mutation.isPending || !question.trim()}
                    className="min-w-[100px]"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Asking...
                      </>
                    ) : (
                      'Ask'
                    )}
                  </Button>
                </div>

                {/* Example Questions */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleExampleClick(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcut Hint */}
                <div className="text-xs text-muted-foreground text-center mt-4">
                  💡 Tip: Press <kbd className="px-2 py-1 bg-muted rounded border">Cmd</kbd> + <kbd className="px-2 py-1 bg-muted rounded border">Enter</kbd> to submit
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Query History */}
          {queryHistory.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle className="text-lg">Recent Queries</CardTitle>
                </div>
                <CardDescription>
                  Click to re-run a previous query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item.question)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors group"
                      disabled={mutation.isPending}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1 group-hover:text-primary">
                          {item.question}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {mutation.isPending && (
            <Card className="mb-6 border-primary animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    <div className="absolute inset-0 h-12 w-12 animate-ping">
                      <Sparkles className="h-12 w-12 text-primary opacity-75" />
                    </div>
                    <div className="absolute -inset-4 h-20 w-20 animate-pulse opacity-20">
                      <div className="h-full w-full rounded-full bg-primary blur-xl" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-1 animate-pulse">Generating SQL with AI...</p>
                    <p className="text-sm text-muted-foreground">
                      Powered by Cerebras Cloud + Llama 3.3 70B
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {mutation.isError && (
            <Card className="mb-6 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : 'Failed to process your question. Please try again.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => mutation.reset()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !mutation.isPending && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* Question & Metadata */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{result.question}</CardTitle>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{result.executionTime}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          <span>{result.results.length} rows</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Generated SQL */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated SQL</CardTitle>
                </CardHeader>
                <CardContent>
                  <SyntaxHighlighter
                    language="sql"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {result.sql}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.insights}</p>
                </CardContent>
              </Card>

              {/* Visualization */}
              {renderChart() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>{renderChart()}</CardContent>
                </Card>
              )}

              {/* Results Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {result.results.length === 0 ? 'No Results' : 'Results'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(result.results[0]).map((key) => (
                              <TableHead key={key} className="font-semibold">
                                {key}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.results.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No results found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
