import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const ResourceRefreshButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <ActionButton
    title={translate('Refresh')}
    icon="fa fa-refresh"
    action={refetch}
    className="me-3"
  />
);
