import { FC, ReactNode } from 'react';

interface StatsCardProps {
  label: ReactNode;
  value: ReactNode;
}

export const StatsCard: FC<StatsCardProps> = ({ label, value }) => (
  <div className="card card-flush card-bordered h-100">
    <div className="card-body d-flex py-5 flex-column">
      <div className="fs-4 fw-bold">{label}</div>
      <div className="flex-grow-1 mt-3">
        <h1 style={{ fontSize: '32px' }}>{value}</h1>
      </div>
    </div>
  </div>
);
