import { FunctionComponent } from 'react';

import { translate } from 'waldur-i18n-runtime';
import { Badge } from 'waldur-ui';

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
