import { MinusIcon, WarningIcon } from '@phosphor-icons/react';

import { Badge } from '@/core/Badge';

export const BooleanIconBadge = ({ value }) => (
  <Badge variant={value ? 'pink' : 'default'} size="sm" pill outline onlyIcon>
    {value ? (
      <WarningIcon weight="bold" size={12} />
    ) : (
      <MinusIcon weight="bold" size={12} />
    )}
  </Badge>
);
