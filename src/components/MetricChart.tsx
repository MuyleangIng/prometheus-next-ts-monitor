import { fetchMetricData } from "../lib/prometheus"
import Chart from "./Chart"

interface MetricChartProps {
  title: string
  query: string
}

export default async function MetricChart({ title, query }: MetricChartProps) {
  const data = await fetchMetricData(query)

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Chart data={data} title={title} />
    </div>
  )
}

