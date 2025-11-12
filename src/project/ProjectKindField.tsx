import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

import { projectKindOptions } from './utils';

export const ProjectKindField = ({ row }) => {
  const options = projectKindOptions();
  const kind = options[row.kind] || options.default;
  return (
    <Badge variant={kind.color} pill outline>
      {row.kind === 'public' ? translate('Global') : kind.label}
    </Badge>
  );
};
