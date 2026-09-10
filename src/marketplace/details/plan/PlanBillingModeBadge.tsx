import { FC } from 'react';

import { Badge } from '@/core/Badge';

import { getPlanBillingModeLabel, PlanBilling } from './billingMode';

const VARIANTS: Record<
  PlanBilling,
  'blue' | 'teal' | 'purple' | 'orange' | 'secondary'
> = {
  limit: 'blue',
  usage: 'teal',
  prepaid: 'purple',
  mixed: 'orange',
  fixed: 'secondary',
};

export const PlanBillingModeBadge: FC<{
  mode: PlanBilling | null | undefined;
  size?: 'sm' | 'lg';
  className?: string;
}> = ({ mode, size, className }) =>
  mode ? (
    <Badge
      variant={VARIANTS[mode]}
      size={size}
      pill
      outline
      className={className}
    >
      {getPlanBillingModeLabel(mode)}
    </Badge>
  ) : null;
