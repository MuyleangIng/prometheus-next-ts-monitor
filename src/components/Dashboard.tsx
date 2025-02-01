import { Suspense } from "react"
import MetricChart from "./MetricChart"

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Suspense fallback={<div>Loading CPU usage...</div>}>
        <MetricChart title="CPU Usage (%)" query="rate(process_cpu_seconds_total[5m]) * 100" />
      </Suspense>
      <Suspense fallback={<div>Loading Memory usage...</div>}>
        <MetricChart title="Memory Usage (bytes)" query="process_resident_memory_bytes" />
      </Suspense>
      <Suspense fallback={<div>Loading HTTP Requests...</div>}>
        <MetricChart title="HTTP Requests Total" query="prometheus_http_requests_total" />
      </Suspense>
      <Suspense fallback={<div>Loading Target Status...</div>}>
        <MetricChart title="Up Targets" query="up" />
      </Suspense>
    </div>
  )
}

