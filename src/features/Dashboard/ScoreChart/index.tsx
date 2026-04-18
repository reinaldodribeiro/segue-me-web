'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { ScoreChartProps } from './types';

const BUCKETS = [
  { label: '0–20',  min: 0,  max: 20  },
  { label: '21–40', min: 21, max: 40  },
  { label: '41–60', min: 41, max: 60  },
  { label: '61–80', min: 61, max: 80  },
  { label: '81–100',min: 81, max: 100 },
];

const BUCKET_COLORS = ['#94a3b8', '#60a5fa', '#8b5cf6', '#7c3aed', '#f59e0b'];

const ScoreChart: React.FC<ScoreChartProps> = ({ people }) => {
  const data = BUCKETS.map((b, i) => ({
    label: b.label,
    count: people.filter((p) => p.engagement_score >= b.min && p.engagement_score <= b.max).length,
    color: BUCKET_COLORS[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
          formatter={(value) => [value, 'Pessoas']}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ScoreChart;
