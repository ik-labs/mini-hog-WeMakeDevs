'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Sidebar } from '@/components/sidebar';
import { apiClient, EventRecord } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface EventsFilters {
  page: number;
  limit: number;
  event_name: string;
  distinct_id: string;
  period: string;
}

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<EventsFilters>({
    page: 1,
    limit: 20,
    event_name: '',
    distinct_id: '',
    period: '7d',
  });

  // Local state for input values (for immediate UI updates)
  const [searchInputs, setSearchInputs] = useState({
    event_name: '',
    distinct_id: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => apiClient.getEvents({
      page: filters.page,
      limit: filters.limit,
      event_name: filters.event_name || undefined,
      distinct_id: filters.distinct_id || undefined,
      period: filters.period,
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const columns: ColumnDef<EventRecord>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => {
        const timestamp = row.original.timestamp as any;
        // Handle DuckDB timestamp objects and string timestamps
        let date;
        
        if (typeof timestamp === 'object') {
          if (timestamp.micros !== undefined) {
            // DuckDB timestamp with microseconds
            date = new Date(timestamp.micros / 1000);
          } else if (timestamp.days !== undefined) {
            // DuckDB date object
            const epoch = new Date(1970, 0, 1);
            date = new Date(epoch.getTime() + timestamp.days * 24 * 60 * 60 * 1000);
          } else {
            date = new Date();
          }
        } else {
          date = new Date(timestamp);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return <span className="text-muted-foreground text-xs">{JSON.stringify(timestamp)}</span>;
        }
        
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground text-xs">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'event',
      header: 'Event',
      cell: ({ row }) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {row.original.event}
        </span>
      ),
    },
    {
      accessorKey: 'distinct_id',
      header: 'User ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.distinct_id}</span>
      ),
    },
    {
      accessorKey: 'session_id',
      header: 'Session ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.session_id || '-'}
        </span>
      ),
    },
    {
      id: 'properties',
      header: 'Properties',
      cell: ({ row }) => {
        const hasProperties = row.original.properties && 
          Object.keys(row.original.properties).length > 0;
        
        if (!hasProperties) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Event Properties</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(row.original.properties, null, 2)}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.events || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.total_pages || 0,
  });

  // Debounced filter updates for search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        event_name: searchInputs.event_name,
        distinct_id: searchInputs.distinct_id,
        page: 1, // Reset to page 1 when search changes
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInputs.event_name, searchInputs.distinct_id]);

  const handleFilterChange = (key: keyof EventsFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? (typeof value === 'number' ? value : Number(value)) : 1, // Reset to page 1 when filters change
    }));
  };

  const handleSearchInput = (key: 'event_name' | 'distinct_id', value: string) => {
    setSearchInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Events Explorer
            </h1>
            <p className="text-muted-foreground">
              View and analyze all captured events
            </p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Time Period
                </label>
                <Select
                  value={filters.period}
                  onValueChange={(value) => handleFilterChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Event Name
                </label>
                <Input
                  placeholder="Filter by event..."
                  value={searchInputs.event_name}
                  onChange={(e) => handleSearchInput('event_name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  User ID
                </label>
                <Input
                  placeholder="Search by user ID..."
                  value={searchInputs.distinct_id}
                  onChange={(e) => handleSearchInput('distinct_id', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Per Page
                </label>
                <Select
                  value={String(filters.limit)}
                  onValueChange={(value) => handleFilterChange('limit', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          {data && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {((data.page - 1) * data.limit) + 1} to{' '}
              {Math.min(data.page * data.limit, data.total)} of {data.total} events
            </div>
          )}

          {/* Events Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Loading events...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-destructive"
                      >
                        Error loading events. Please try again.
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {data.page} of {data.total_pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === data.total_pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
