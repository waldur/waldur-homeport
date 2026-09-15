import { FC } from 'react';
import type { QueueKindEnum } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

const KIND_BADGES: Record<
  QueueKindEnum,
  { variant: string; outline: boolean; label: string; tip: string }
> = {
  consumer: {
    variant: 'primary',
    outline: false,
    label: translate('Consumer'),
    tip: translate('Unified pub/sub queue: receives every enabled event type'),
  },
  legacy: {
    variant: 'secondary',
    outline: true,
    label: translate('Legacy'),
    tip: translate('Per-object-type event subscription queue'),
  },
  unknown: {
    variant: 'light',
    outline: true,
    label: translate('Unknown'),
    tip: translate('Not a Waldur event queue'),
  },
};

export const QueueKindBadge: FC<{ kind: QueueKindEnum; id: string }> = ({
  kind,
}) => {
  const config = KIND_BADGES[kind];
  return (
    <Tooltip label={config.tip}>
      <Badge variant={config.variant} pill outline={config.outline}>
        {config.label}
      </Badge>
    </Tooltip>
  );
};
