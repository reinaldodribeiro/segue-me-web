import api from "@/config/api";
import type { EngagementReportData } from "@/features/Reports/types";

/**
 * Fetches engagement reports for multiple parishes in parallel and merges them
 * into a single aggregated result (weighted average score, summed counts, etc.).
 *
 * Field mapping from backend:
 *   total_active  → summed across parishes
 *   average_score → weighted average (by total_active)
 *   by_level      → summed per level
 *   top_20        → merged, deduplicated, top 10
 */
export async function aggregateEngagement(
  parishIds: string[],
): Promise<EngagementReportData | null> {
  if (!parishIds.length) return null;

  const results = await Promise.all(
    parishIds.map((id) =>
      api
        .get(`parishes/${id}/report/engagement`)
        .then((r: any) => (r.data?.data ?? r.data) as EngagementReportData)
        .catch(() => null),
    ),
  );

  const valid = results.filter(Boolean) as EngagementReportData[];
  if (!valid.length) return null;

  const total_active = valid.reduce((s, r) => s + (r.total_active ?? 0), 0);

  const average_score =
    total_active > 0
      ? valid.reduce(
          (s, r) => s + (r.average_score ?? 0) * (r.total_active ?? 0),
          0,
        ) / total_active
      : 0;

  const by_level: Record<string, number> = {};
  for (const r of valid) {
    for (const [level, count] of Object.entries(r.by_level ?? {})) {
      by_level[level] = (by_level[level] ?? 0) + Number(count);
    }
  }

  const top_20 = valid
    .flatMap((r) => r.top_20 ?? [])
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 10);

  return { total_active, average_score, by_level, top_20 };
}
