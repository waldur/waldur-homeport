import { FC } from 'react';

import { translate } from '@/i18n';

interface CapacityIndicatorProps {
  open: number;
  max: number;
}

/** Open tickets vs. max capacity, coloured by load. */
export const CapacityIndicator: FC<CapacityIndicatorProps> = ({
  open,
  max,
}) => {
  if (!max) {
    return <span className="text-muted">{translate('Unlimited')}</span>;
  }
  const ratio = open / max;
  const variant =
    ratio >= 1 ? 'bg-danger' : ratio >= 0.75 ? 'bg-warning' : 'bg-success';
  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 90 }}>
      <div className="progress flex-grow-1" style={{ height: 6 }}>
        <div
          className={`progress-bar ${variant}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
      <small className="text-nowrap">
        {open}/{max}
      </small>
    </div>
  );
};
