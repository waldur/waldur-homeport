import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

export const StatusBreakdown: FC<{
  statuses: {
    key: string;
    label: string;
    value: number;
    variant: string;
  }[];
}> = ({ statuses }) => {
  return (
    <div className="d-flex flex-row gap-2">
      <div>{translate('Status breakdown')}:</div>
      {statuses.map(({ key, label, value, variant }) => (
        <Badge key={key} variant={variant}>
          {label} • {value}
        </Badge>
      ))}
    </div>
  );
};
