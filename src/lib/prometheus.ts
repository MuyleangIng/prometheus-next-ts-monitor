export async function fetchMetricData(query: string) {
  const end = Math.floor(Date.now() / 1000)
  const start = end - 3600 // Last hour
  const step = 60 // 1 minute resolution

  const response = await fetch(
    `http://localhost:9090/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`,
    { cache: "no-store" },
  )
  const data = await response.json()

  if (data.status === "success" && data.data.result.length > 0) {
    return data.data.result[0].values.map(([timestamp, value]: [number, string]) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      value: Number.parseFloat(value),
    }))
  }

  return []
}

