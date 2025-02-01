"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartProps {
  data: Array<{ timestamp: string; value: number }>
  title: string
}

const formatValue = (value: number, title: string) => {
  if (title.includes("(%)")) {
    return `${value.toFixed(2)}%`
  } else if (title.includes("(bytes/sec)")) {
    return `${(value / 1024 / 1024).toFixed(2)} MB/s`
  } else {
    return value.toFixed(2)
  }
}

export default function Chart({ data, title }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No data available. Please check Prometheus connection.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
        <YAxis tickFormatter={(tick) => formatValue(tick, title)} />
        <Tooltip
          formatter={(value: number) => formatValue(value, title)}
          labelFormatter={(label) => new Date(label).toLocaleString()}
        />
        <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

