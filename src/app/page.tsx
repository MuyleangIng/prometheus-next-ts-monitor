// src/app/page.tsx
import { OrderersMetrics } from '@/components/OrderersMetrics';

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <OrderersMetrics 
        title="CPU Usage"
        metricType="cpu"
      />
      <OrderersMetrics 
        title="Memory Usage"
        metricType="memory"
      />
    </div>
  );
}