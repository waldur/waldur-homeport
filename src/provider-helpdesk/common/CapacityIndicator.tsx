import { FC } from 'react';

import { Progress } from 'waldur-ui';

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
      <Progress
        size="sm"
        value={Math.min(open, max)}
        max={max}
        variant={variant}
      />
      <small className="text-nowrap">
        {open}/{max}
      </small>
    </div>
  );
};
