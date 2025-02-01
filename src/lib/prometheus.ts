export async function fetchMetricData(query: string) {
  try {
    const end = Math.floor(Date.now() / 1000)
    const start = end - 3600 // Last hour
    const step = 60 // 1 minute resolution

    const url = `http://localhost:9090/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`

    console.log("Fetching data from:", url)

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Response data:", data)

    if (data.status === "success" && data.data.result.length > 0) {
      return data.data.result[0].values.map(([timestamp, value]: [number, string]) => ({
        timestamp: timestamp * 1000,
        value: Number.parseFloat(value),
      }))
    } else if (data.status === "success" && data.data.result.length === 0) {
      console.log("No data returned for query:", query)
      return []
    } else {
      console.error("Error in response:", data)
      return []
    }
  } catch (error) {
    console.error("Error fetching metric:", error)
    return []
  }
}

