import { FC } from 'react';

import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface StatWidgetCardProps {
  label: string;
  value: string;
  changes: number;
}

export const StatWidgetCard: FC<StatWidgetCardProps> = ({
  label,
  value,
  changes,
}) => {
  return (
    <div className="card card-bordered h-full">
      <div className="card-body py-5">
        <div className="text-sm text-quaternary font-medium mb-1">{label}</div>
        <div className="flex items-center justify-between self-stretch gap-1.5">
          <div className="display-6 font-bold">{value}</div>
          <ChangesAmountBadge
            changes={changes}
            showOnInfinity
            fractionDigits={0}
          />
        </div>
      </div>
    </div>
  );
};
