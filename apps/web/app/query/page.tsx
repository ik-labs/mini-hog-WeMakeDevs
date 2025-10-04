import { Sidebar } from '@/components/sidebar';

export default function QueryPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">AI Query</h1>
            <p className="text-muted-foreground">
              Ask questions in natural language (Coming soon)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
