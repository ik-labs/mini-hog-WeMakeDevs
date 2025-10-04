'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { apiClient, type FeatureFlag, type CreateFlagInput, type UpdateFlagInput } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Flag, Plus, Trash2, TestTube, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FlagsPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<string | null>(null);
  const [testUserId, setTestUserId] = useState('');
  const [testFlagKey, setTestFlagKey] = useState('');
  const [testResult, setTestResult] = useState<{ enabled: boolean; reason: string } | null>(null);

  // Fetch flags
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['flags'],
    queryFn: () => apiClient.getFlags(),
  });

  // Create flag mutation
  const createMutation = useMutation({
    mutationFn: (flag: CreateFlagInput) => apiClient.createFlag(flag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      setCreateDialogOpen(false);
      toast.success('Feature flag created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create flag: ${error.message}`);
    },
  });

  // Update flag mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, updates }: { key: string; updates: UpdateFlagInput }) =>
      apiClient.updateFlag(key, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      toast.success('Feature flag updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update flag: ${error.message}`);
    },
  });

  // Delete flag mutation
  const deleteMutation = useMutation({
    mutationFn: (key: string) => apiClient.deleteFlag(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      setDeleteDialogOpen(false);
      setFlagToDelete(null);
      toast.success('Feature flag deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete flag: ${error.message}`);
    },
  });

  // Test evaluation mutation
  const testMutation = useMutation({
    mutationFn: ({ key, userId }: { key: string; userId: string }) =>
      apiClient.evaluateFlag(key, userId),
    onSuccess: (data) => {
      setTestResult({ enabled: data.enabled, reason: data.reason });
    },
    onError: (error: Error) => {
      toast.error(`Failed to evaluate flag: ${error.message}`);
    },
  });

  const handleCreateFlag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const flag: CreateFlagInput = {
      key: formData.get('key') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      active: true,
      rollout_percentage: 0,
    };

    createMutation.mutate(flag);
  };

  const handleToggleActive = (flag: FeatureFlag) => {
    updateMutation.mutate({
      key: flag.key,
      updates: { active: !flag.active },
    });
  };

  const handleRolloutChange = (flag: FeatureFlag, value: number[]) => {
    updateMutation.mutate({
      key: flag.key,
      updates: { rollout_percentage: value[0] } as UpdateFlagInput,
    });
  };

  const handleDeleteClick = (key: string) => {
    setFlagToDelete(key);
    setDeleteDialogOpen(true);
  };

  const handleTestEvaluation = () => {
    if (!testFlagKey || !testUserId) {
      toast.error('Please enter both flag key and user ID');
      return;
    }
    testMutation.mutate({ key: testFlagKey, userId: testUserId });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
              </div>
              <p className="text-muted-foreground">
                Control feature rollout with progressive percentage-based flags
              </p>
            </div>

            {/* Create Flag Button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Flag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateFlag}>
                  <DialogHeader>
                    <DialogTitle>Create Feature Flag</DialogTitle>
                    <DialogDescription>
                      Create a new feature flag to control feature rollout
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="key">Key *</Label>
                      <Input
                        id="key"
                        name="key"
                        placeholder="new_feature_flag"
                        required
                        pattern="[a-z0-9_]+"
                        title="Only lowercase letters, numbers, and underscores"
                      />
                      <p className="text-xs text-muted-foreground">
                        Unique identifier (lowercase, numbers, underscores only)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="New Feature"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Flag'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Flags List */}
          {!isLoading && flags.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feature flags yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first feature flag to get started
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Flag
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && flags.length > 0 && (
            <div className="space-y-4 mb-8">
              {flags.map((flag) => (
                <Card key={flag.key}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{flag.name}</CardTitle>
                          <Badge variant={flag.active ? 'default' : 'secondary'}>
                            {flag.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {flag.key}
                          </Badge>
                        </div>
                        {flag.description && (
                          <CardDescription>{flag.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(flag.key)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Active Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={`active-${flag.key}`}>Enable Flag</Label>
                        <p className="text-sm text-muted-foreground">
                          Turn this flag on or off for all users
                        </p>
                      </div>
                      <Switch
                        id={`active-${flag.key}`}
                        checked={flag.active}
                        onCheckedChange={() => handleToggleActive(flag)}
                      />
                    </div>

                    {/* Rollout Percentage Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`rollout-${flag.key}`}>Rollout Percentage</Label>
                        <span className="text-sm font-medium">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                      <Slider
                        id={`rollout-${flag.key}`}
                        value={[flag.rolloutPercentage]}
                        onValueChange={(value) => handleRolloutChange(flag, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of users who will see this feature enabled
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <span>
                          Created: {new Date(flag.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Updated: {new Date(flag.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Test Evaluation */}
          {flags.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  <CardTitle className="text-lg">Test Flag Evaluation</CardTitle>
                </div>
                <CardDescription>
                  Test how a flag evaluates for a specific user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-flag">Flag Key</Label>
                    <Input
                      id="test-flag"
                      placeholder="feature_flag_key"
                      value={testFlagKey}
                      onChange={(e) => setTestFlagKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-user">User ID</Label>
                    <Input
                      id="test-user"
                      placeholder="user123"
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleTestEvaluation}
                  disabled={testMutation.isPending || !testFlagKey || !testUserId}
                  className="w-full"
                >
                  {testMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Evaluation
                    </>
                  )}
                </Button>

                {/* Test Result */}
                {testResult && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={testResult.enabled ? 'default' : 'secondary'}>
                        {testResult.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reason: {testResult.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the feature flag
              <span className="font-mono font-semibold"> {flagToDelete}</span> and all
              associated evaluation decisions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => flagToDelete && deleteMutation.mutate(flagToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Flag'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
