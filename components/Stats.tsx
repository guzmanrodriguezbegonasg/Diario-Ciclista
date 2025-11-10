
import React from 'react';

interface StatsProps {
  todayTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

const StatCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-700">
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
    <p className="text-4xl font-bold text-amber-400 mt-2">
      {value.toLocaleString('es-ES')} <span className="text-2xl text-slate-300 font-normal">km</span>
    </p>
  </div>
);

const Stats: React.FC<StatsProps> = ({ todayTotal, weeklyTotal, monthlyTotal, yearlyTotal }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
      <StatCard title="Hoy" value={Math.round(todayTotal)} />
      <StatCard title="Esta Semana" value={Math.round(weeklyTotal)} />
      <StatCard title="Este Mes" value={Math.round(monthlyTotal)} />
      <StatCard title="Este Año" value={Math.round(yearlyTotal)} />
    </div>
  );
};

export default Stats;
