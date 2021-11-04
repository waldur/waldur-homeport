import { FunctionComponent } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

export const PermissionRequestStateField: FunctionComponent<{ row }> = ({
  row,
}) => {
  const state = row.state;
  return (
    <StateIndicator
      label={translate(state)}
      variant={
        state === 'rejected'
          ? 'danger'
          : state === 'pending'
          ? 'warning'
          : 'primary'
      }
    />
  );
};
