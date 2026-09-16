import { FC } from 'react';
import { SramGroupKindEnum } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const SramGroupKindBadge: FC<{ kind: SramGroupKindEnum }> = ({
  kind,
}) =>
  kind === 'co' ? (
    <Badge variant="blue" size="sm" shape="pill" tone="outline">
      {translate('Collaboration')}
    </Badge>
  ) : (
    <Badge variant="neutral" size="sm" shape="pill" tone="outline">
      {translate('Group')}
    </Badge>
  );
