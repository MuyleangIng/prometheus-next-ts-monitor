"use client"

import { useState, useEffect } from "react"
import { AreaChart } from "@tremor/react"
import { fetchMetricData } from "../lib/prometheus"

export default function DiskUsageChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchMetricData(
        '100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})',
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
      colors={["yellow"]}
      valueFormatter={(number) => `${number.toFixed(2)}%`}
      yAxisWidth={40}
    />
  )
}

