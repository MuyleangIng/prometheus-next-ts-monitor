// src/components/OrderersStatus.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrdererMetric {
  instance: string;
  status: string;
  lastScrape: string;
  responseTime: string;
}

export function OrderersStatus() {
  const [data, setData] = React.useState<OrdererMetric[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const params = new URLSearchParams({
          query: 'up{job="orderers"}'
        });

        const response = await fetch(`/api/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Transform the data
        const ordererData = jsonData.data.result.map((item: any) => ({
          instance: item.metric.instance,
          status: item.values[item.values.length - 1][1] === "1" ? "UP" : "DOWN",
          lastScrape: new Date().toLocaleTimeString(),
          responseTime: "2ms" // You can update this with actual response time if available
        }));
        
        setData(ordererData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading orderer status...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Orderers Status (3/3 up)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Scrape
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((orderer) => (
              <tr key={orderer.instance}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                  {`http://${orderer.instance}/metrics`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {orderer.instance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {orderer.lastScrape}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    orderer.status === "UP" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {orderer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/app/page.tsx