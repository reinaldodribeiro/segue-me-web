export interface TopEngagedEntry {
  id: string;
  name: string;
  engagement_score: number;
  engagement_level: string;
}

export interface TopEngagedListProps {
  people: TopEngagedEntry[];
  /** Number of rows to display. Default: 5. */
  limit?: number;
  /** Show skeleton placeholders while loading. */
  loading?: boolean;
  /** Show score gauge bar at the bottom. */
  showGauge?: boolean;
  /** Average score displayed in the gauge (only shown when showGauge=true). */
  avgScore?: number;
  /** Link to view all people. */
  viewAllHref?: string;
}
