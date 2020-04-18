import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { refreshResource } from './actions';

export const ResourceRefreshButton = () => (
  <ActionButton
    title={translate('Refresh')}
    icon="fa fa-refresh"
    action={refreshResource}
  />
);
