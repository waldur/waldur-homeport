import { CheckIcon, XIcon } from '@phosphor-icons/react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const BooleanBadge = ({ value }) =>
  value ? (
    <Badge
      variant="success"
      outline
      pill
      size="sm"
      leftIcon={<CheckIcon weight="bold" />}
    >
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge
      variant="danger"
      outline
      pill
      size="sm"
      leftIcon={<XIcon weight="bold" />}
    >
      {translate('No')}
    </Badge>
  );
