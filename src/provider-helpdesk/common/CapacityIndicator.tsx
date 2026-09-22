import { FC } from 'react';

import { ProgressBar } from '@/core/ProgressBar';
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
  const variant = ratio >= 1 ? 'danger' : ratio >= 0.75 ? 'warning' : 'success';
  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 90 }}>
      <ProgressBar
        now={Math.min(open, max)}
        max={max}
        variant={variant}
        neutralTrack
        className="h-6px shadow-none"
      />
      <small className="text-nowrap">
        {open}/{max}
      </small>
    </div>
  );
};
