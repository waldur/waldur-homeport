import { CheckIcon, XIcon } from '@phosphor-icons/react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const BooleanBadge = ({ value }) =>
  value ? (
    <Badge
      variant="success"
      size="sm"
      leftIcon={<CheckIcon weight="bold" />}
      pill
      outline
    >
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge
      variant="danger"
      size="sm"
      leftIcon={<XIcon weight="bold" />}
      pill
      outline
    >
      {translate('No')}
    </Badge>
  );
