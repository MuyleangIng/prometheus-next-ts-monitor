// src/components/MetricsChart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  query?: string;
  title: string;
}

export function MetricsChart({ query = 'up', title }: MetricsChartProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get current time range
        const end = Math.floor(Date.now() / 1000);
        const start = end - 3600; // Last hour
        
        const params = new URLSearchParams({
          query: query,
          start: start.toString(),
          end: end.toString(),
          step: '60' // 1 minute intervals
        });

        const response = await fetch(`/api/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Transform data if needed
        const transformedData = jsonData.data?.result?.[0]?.values?.map(
          ([timestamp, value]: [number, string]) => ({
            timestamp: new Date(timestamp * 1000).toISOString(),
            value: parseFloat(value)
          })
        ) || [];
        
        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [query]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading metrics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            formatter={(value: number) => [value.toFixed(2), 'Value']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            dot={false}
            name="Metric Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}