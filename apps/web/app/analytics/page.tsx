import { Sidebar } from '@/components/sidebar';

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed analytics and event explorer (Coming soon)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
