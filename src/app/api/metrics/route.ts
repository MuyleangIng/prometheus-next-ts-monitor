// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://prometheus.kangtido.life';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }

    const end = Math.floor(Date.now() / 1000);
    const start = end - 3600; // Last hour
    
    const prometheusParams = new URLSearchParams({
      query,
      start: start.toString(),
      end: end.toString(),
      step: '60'
    });

    const prometheusUrl = `${BASE_URL}/api/v1/query_range`;
    console.log('Fetching from:', `${prometheusUrl}?${prometheusParams.toString()}`);

    const response = await fetch(`${prometheusUrl}?${prometheusParams.toString()}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Prometheus API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}