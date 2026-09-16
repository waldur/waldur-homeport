import { FC } from 'react';
import type { QueueKindEnum } from 'waldur-js-client';

import { BadgeTone, BadgeVariant, Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

const KIND_BADGES: Record<
  QueueKindEnum,
  { variant: BadgeVariant; tone: BadgeTone; label: string; tip: string }
> = {
  consumer: {
    variant: 'primary',
    tone: 'solid',
    label: translate('Consumer'),
    tip: translate('Unified pub/sub queue: receives every enabled event type'),
  },
  legacy: {
    variant: 'secondary',
    tone: 'outline',
    label: translate('Legacy'),
    tip: translate('Per-object-type event subscription queue'),
  },
  unknown: {
    variant: 'neutral',
    tone: 'outline',
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
      <Badge variant={config.variant} shape="pill" tone={config.tone}>
        {config.label}
      </Badge>
    </Tooltip>
  );
};
