import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

/** Marks a step that runs once for the whole round, not per proposal. */
export const RoundScopedBadge: FC<{ className?: string }> = ({ className }) => (
  <Badge
    variant="info"
    size="sm"
    shape="pill"
    tone="outline"
    className={className}
  >
    {translate('Once per round')}
  </Badge>
);
