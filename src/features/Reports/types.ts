export interface EngagementTopPerson {
  id: string;
  name: string;
  type: string;
  partner_name: string | null;
  engagement_score: number;
  engagement_level: string;
  confirmed_participations: number;
  total_refusals: number;
}

export interface EngagementReportData {
  parish_id?: string;
  /** Total number of active people in scope. Backend field: `total_active`. */
  total_active: number;
  average_score: number;
  by_level: Record<string, number>;
  /** Top 20 most engaged people. Backend field: `top_20`. */
  top_20: EngagementTopPerson[];
}
