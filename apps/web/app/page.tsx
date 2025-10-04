import { Sidebar } from '@/components/sidebar';
import { DashboardContent } from '@/components/dashboard-content';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <DashboardContent />
      </main>
    </div>
  );
}
