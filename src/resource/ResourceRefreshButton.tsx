import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table-react/ActionButton';

export const ResourceRefreshButton = ({ refreshResource }) => (
  <ActionButton
    title={translate('Refresh')}
    icon="fa fa-refresh"
    action={refreshResource}
  />
);
