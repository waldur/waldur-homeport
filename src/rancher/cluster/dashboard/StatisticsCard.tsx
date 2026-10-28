import { FC } from 'react';

interface StatisticsCardProps {
  title: string;
  value: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({ title, value }) => (
  <div className="card card-bordered mb-4">
    <div className="card-body">
      <span className="block text-quaternary mb-2.5">{title}</span>
      <h1 className="block text-2xl mb-0 text-primary">{value}</h1>
    </div>
  </div>
);
