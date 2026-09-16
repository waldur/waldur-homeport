import { FC } from 'react';
import { SramGroupKindEnum } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

export const SramGroupKindBadge: FC<{ kind: SramGroupKindEnum }> = ({
  kind,
}) =>
  kind === 'co' ? (
    <Badge variant="blue" size="sm" pill outline>
      {translate('Collaboration')}
    </Badge>
  ) : (
    <Badge variant="default" size="sm" pill outline>
      {translate('Group')}
    </Badge>
  );
