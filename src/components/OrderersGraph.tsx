// src/components/OrderersGraph.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MetricsChartProps {
  query?: string;
  title: string;
}

export function OrderersGraph({ query = 'up{job="orderers"}', title }: MetricsChartProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const end = Math.floor(Date.now() / 1000);
        const start = end - 3600; // Last hour
        
        const params = new URLSearchParams({
          query,
          start: start.toString(),
          end: end.toString(),
          step: '60'
        });

        const response = await fetch(`/api/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Transform the data for the graph
        const timeSeriesData = new Map();
        
        jsonData.data.result.forEach((series: any) => {
          const instance = series.metric.instance;
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const time = timestamp * 1000; // Convert to milliseconds
            if (!timeSeriesData.has(time)) {
              timeSeriesData.set(time, { timestamp: time });
            }
            const point = timeSeriesData.get(time);
            point[instance] = Number(value);
          });
        });

        const transformedData = Array.from(timeSeriesData.values())
          .sort((a, b) => a.timestamp - b.timestamp);
        
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

  // Get unique instances for creating lines
  const instances = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'timestamp')
    : [];

  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00C49F',
  ];

  return (
    <div className="w-full h-[500px] p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
            scale="time"
          />
          <YAxis domain={[0, 1.2]} />
          <Tooltip 
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            formatter={(value: number) => [value === 1 ? 'UP' : 'DOWN', 'Status']}
          />
          <Legend />
          {instances.map((instance, index) => (
            <Line
              key={instance}
              type="monotone"
              dataKey={instance}
              name={`Orderer ${index + 1}`}
              stroke={colors[index % colors.length]}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
