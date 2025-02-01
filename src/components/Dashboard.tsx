"use client"

import { Card, Grid, Title } from "@tremor/react"
import CPUUsageChart from "./CPUUsageChart"
import MemoryUsageChart from "./MemoryUsageChart"
import DiskUsageChart from "./DiskUsageChart"
import NetworkTrafficChart from "./NetworkTrafficChart"

export default function Dashboard() {
  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-4">
      <Card>
        <Title>CPU Usage</Title>
        <CPUUsageChart />
      </Card>
      <Card>
        <Title>Memory Usage</Title>
        <MemoryUsageChart />
      </Card>
      <Card>
        <Title>Disk Usage</Title>
        <DiskUsageChart />
      </Card>
      <Card>
        <Title>Network Traffic</Title>
        <NetworkTrafficChart />
      </Card>
    </Grid>
  )
}

