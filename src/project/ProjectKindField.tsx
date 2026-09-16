import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { projectKindOptions } from './utils';

export const ProjectKindField = ({ row }) => {
  const options = projectKindOptions();
  const kind = options[row.kind] || options.default;
  return (
    <Badge variant={kind.color} shape="pill" tone="outline">
      {row.kind === 'public' ? translate('Global') : kind.label}
    </Badge>
  );
};
