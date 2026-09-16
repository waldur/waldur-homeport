import { CheckIcon, XIcon } from '@phosphor-icons/react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const BooleanBadge = ({ value }) =>
  value ? (
    <Badge
      variant="success"
      size="sm"
      leftIcon={<CheckIcon weight="bold" />}
      shape="pill"
      tone="outline"
    >
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge
      variant="danger"
      size="sm"
      leftIcon={<XIcon weight="bold" />}
      shape="pill"
      tone="outline"
    >
      {translate('No')}
    </Badge>
  );
