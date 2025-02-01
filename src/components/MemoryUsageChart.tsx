"use client"

import { useState, useEffect } from "react"
import { AreaChart } from "@tremor/react"
import { fetchMetricData } from "../lib/prometheus"

export default function MemoryUsageChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchMetricData(
        "100 * (1 - ((node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes) / node_memory_MemTotal_bytes))",
      )
      setData(result)
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <AreaChart
      className="h-72 mt-4"
      data={data}
      index="timestamp"
      categories={["value"]}
      colors={["green"]}
      valueFormatter={(number) => `${number.toFixed(2)}%`}
      yAxisWidth={40}
    />
  )
}

