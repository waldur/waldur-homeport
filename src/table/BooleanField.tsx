import { FunctionComponent } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

interface BooleanFieldProps {
  value: boolean;
}

export const BooleanField: FunctionComponent<BooleanFieldProps> = ({
  value,
}) =>
  value ? (
    <Badge variant="success" shape="pill" tone="outline">
      {translate('Yes')}
    </Badge>
  ) : (
    <Badge variant="neutral" shape="pill" tone="outline">
      {translate('No')}
    </Badge>
  );
