import { MinusIcon, WarningIcon } from '@phosphor-icons/react';

import { Badge } from 'waldur-ui';

export const BooleanIconBadge = ({ value }) => (
  <Badge
    variant={value ? 'pink' : 'neutral'}
    size="sm"
    shape="pill"
    tone="outline"
    onlyIcon
  >
    {value ? (
      <WarningIcon weight="bold" size={12} />
    ) : (
      <MinusIcon weight="bold" size={12} />
    )}
  </Badge>
);
