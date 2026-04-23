import { StatsBarProps } from './types';

const StatsBar: SafeFC<StatsBarProps> = ({ totalFilled, totalSlots, totalConfirmed, teamsComplete, teamsLength }) => {
  const stats = [
    { label: 'Vagas preenchidas', value: `${totalFilled}/${totalSlots}`, color: 'text-text' },
    { label: 'Confirmados',       value: totalConfirmed,                  color: 'text-green-600' },
    { label: 'Pendentes',         value: totalFilled - totalConfirmed,    color: 'text-amber-600' },
    { label: 'Equipes completas', value: `${teamsComplete}/${teamsLength}`, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tutorial="teams-stats-bar">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-panel border border-border rounded-xl px-4 py-3 text-center">
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-text-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
