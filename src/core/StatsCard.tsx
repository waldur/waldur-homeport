import { FC, ReactNode } from 'react';

interface StatsCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional glyph in the top-right corner, naming what the figure measures. */
  icon?: ReactNode;
  /** Optional line under the value — a delta badge, a comparison, a caption. */
  footer?: ReactNode;
}

export const StatsCard: FC<StatsCardProps> = ({
  label,
  value,
  icon,
  footer,
}) => (
  <div className="card card-flush card-bordered h-100">
    <div className="card-body d-flex py-5 flex-column">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="fs-6 fw-bold text-quaternary">{label}</div>
        {icon}
      </div>
      <div className="flex-grow-1 mt-3">
        <h1 style={{ fontSize: '32px' }}>{value}</h1>
      </div>
      {footer && (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          {footer}
        </div>
      )}
    </div>
  </div>
);
