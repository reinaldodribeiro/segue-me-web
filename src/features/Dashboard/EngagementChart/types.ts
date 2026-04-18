export interface EngagementChartEntry {
  level: string;
  count: number;
  pct: number;
}

export interface EngagementChartProps {
  data: EngagementChartEntry[];
}
