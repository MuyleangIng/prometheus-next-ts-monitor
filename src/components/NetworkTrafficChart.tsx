"use client"

import { useState, useEffect } from "react"
import { AreaChart } from "@tremor/react"
import { fetchMetricData } from "../lib/prometheus"

export default function NetworkTrafficChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchMetricData(
        "sum(rate(node_network_receive_bytes_total[5m])) + sum(rate(node_network_transmit_bytes_total[5m]))",
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
      colors={["purple"]}
      valueFormatter={(number) => `${(number / 1024 / 1024).toFixed(2)} MB/s`}
      yAxisWidth={60}
    />
  )
}

