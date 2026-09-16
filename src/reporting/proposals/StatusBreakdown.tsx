import { FC } from 'react';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const StatusBreakdown: FC<{
  statuses: {
    key: string;
    label: string;
    value: number;
    variant: BadgeVariant;
  }[];
}> = ({ statuses }) => {
  return (
    <div className="d-flex flex-row gap-2">
      <div>{translate('Status breakdown')}:</div>
      {statuses.map(({ key, label, value, variant }) => (
        <Badge key={key} variant={variant} tone="outline">
          {label} • {value}
        </Badge>
      ))}
    </div>
  );
};
