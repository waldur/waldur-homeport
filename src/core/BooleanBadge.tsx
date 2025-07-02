import { CheckIcon, XIcon } from '@phosphor-icons/react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const BooleanBadge = ({ value }) =>
  value ? (
    <Badge variant="success" outline pill size="sm">
      <CheckIcon size={12} className="text-success me-2" />
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge variant="danger" outline pill size="sm">
      <XIcon size={12} className="text-danger me-2" />
      {translate('No')}
    </Badge>
  );
