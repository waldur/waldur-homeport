import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const ResourceRefreshButton: FunctionComponent<{ refreshResource }> = ({
  refreshResource,
}) => (
  <ActionButton
    title={translate('Refresh')}
    icon="fa fa-refresh"
    action={refreshResource}
  />
);
