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
  <div className="card card-flush card-bordered h-full">
    <div className="card-body flex py-5 flex-col">
      <div className="flex justify-between items-start gap-2">
        <div className="text-sm font-medium text-quaternary">{label}</div>
        {icon}
      </div>
      <div className="grow mt-3">
        <h1 className="text-3xl font-bold">{value}</h1>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center gap-2 mt-2">{footer}</div>
      )}
    </div>
  </div>
);
