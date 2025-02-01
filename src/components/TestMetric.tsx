import { fetchMetricData } from "../lib/prometheus"
import Chart from "./Chart"

export default async function TestMetric() {
  const query = "prometheus_http_requests_total"
  const data = await fetchMetricData(query)

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Prometheus HTTP Requests</h2>
      <Chart data={data} />
    </div>
  )
}

