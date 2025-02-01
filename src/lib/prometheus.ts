// src/lib/prometheus.ts

interface PrometheusMetric {
  __name__: string;
  instance: string;
  job: string;
  [key: string]: string;
}

interface PrometheusResult {
  metric: PrometheusMetric;
  values: [number, string][];
}

interface PrometheusResponse {
  status: 'success' | 'error';
  data: {
    resultType: string;
    result: PrometheusResult[];
  };
  error?: string;
}

interface MetricDataPoint {
  timestamp: string;
  value: number;
  instance?: string;
  job?: string;
}

interface FetchOptions {
  timeRange?: number;
  step?: number;
}

export async function fetchMetricData(
  query: string,
  options: FetchOptions = {}
): Promise<MetricDataPoint[]> {
  try {
    const {
      timeRange = 3600,
      step = 60
    } = options;

    const end = Math.floor(Date.now() / 1000);
    const start = end - timeRange;

    const response = await fetch(
      `http://localhost:9090/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PrometheusResponse = await response.json();

    if (data.status === 'error') {
      throw new Error(data.error || 'Unknown Prometheus error');
    }

    if (!data.data?.result?.length) {
      return [];
    }

    // Flatten and transform all results
    return data.data.result.flatMap(result => 
      result.values.map(([timestamp, value]) => ({
        timestamp: new Date(timestamp * 1000).toISOString(),
        value: Number.parseFloat(value),
        instance: result.metric.instance,
        job: result.metric.job
      }))
    );
  } catch (error) {
    console.error('Error fetching metric data:', error);
    throw error;
  }
}
