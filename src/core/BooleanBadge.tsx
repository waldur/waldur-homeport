import { Check, X } from '@phosphor-icons/react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const BooleanBadge = ({ value }) =>
  value ? (
    <Badge variant="success" outline pill size="sm">
      <Check size={12} className="text-success me-2" />
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge variant="danger" outline pill size="sm">
      <X size={12} className="text-danger me-2" />
      {translate('No')}
    </Badge>
  );
