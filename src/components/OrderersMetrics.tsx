// src/components/OrderersMetrics.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MetricsChartProps {
  title: string;
  metricType: 'cpu' | 'memory';
}

export function OrderersMetrics({ title, metricType }: MetricsChartProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const end = Math.floor(Date.now() / 1000);
        const start = end - 3600; // Last hour

        // Query for either CPU or Memory metrics
        const query = metricType === 'cpu' 
          ? 'rate(process_cpu_seconds_total{job="peer1"}[5m])*100' // CPU usage in percentage
          : 'process_resident_memory_bytes{job="peer1"}/1024/1024'; // Memory in MB
        
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
          const instance = series.metric.instance.split(':')[0]; // Clean up instance name
          series.values.forEach(([timestamp, value]: [number, string]) => {
            const time = timestamp * 1000; // Convert to milliseconds
            if (!timeSeriesData.has(time)) {
              timeSeriesData.set(time, { timestamp: time });
            }
            const point = timeSeriesData.get(time);
            point[instance] = Number(parseFloat(value).toFixed(2));
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
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [metricType]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading metrics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

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

  const formatValue = (value: number) => {
    if (metricType === 'memory') {
      return `${value.toFixed(2)} MB`;
    }
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
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
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => metricType === 'memory' ? `${value} MB` : `${value}%`}
          />
          <Tooltip 
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            formatter={(value: number) => [formatValue(value), metricType === 'memory' ? 'Memory Usage' : 'CPU Usage']}
          />
          <Legend />
          {instances.map((instance, index) => (
            <Line
              key={instance}
              type="monotone"
              dataKey={instance}
              name={instance}
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

