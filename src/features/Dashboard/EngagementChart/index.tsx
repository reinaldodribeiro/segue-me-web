'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EngagementChartProps } from './types';

const COLORS: Record<string, string> = {
  baixo:    '#94a3b8',
  medio:    '#60a5fa',
  alto:     '#8b5cf6',
  destaque: '#f59e0b',
};

const LABELS: Record<string, string> = {
  baixo: 'Baixo', medio: 'Médio', alto: 'Alto', destaque: 'Destaque',
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) => {
  if (percent == null || percent < 0.05) return null;
  if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const EngagementChart: SafeFC<EngagementChartProps> = ({ data }) => {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: LABELS[d.level] ?? d.level,
    value: d.count,
    level: d.level,
  }));

  if (chartData.length === 0) {
    return <p className="text-xs text-text-muted text-center py-8">Sem dados de engajamento.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((entry) => (
            <Cell key={entry.level} fill={COLORS[entry.level] ?? '#94a3b8'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
          formatter={(value, name) => [value, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: '#6b7280' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default EngagementChart;
