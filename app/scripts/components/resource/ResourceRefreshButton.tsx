import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import ActionButton from '@waldur/table-react/ActionButton';

import { refreshResource } from './actions';

export const PureResourceRefreshButton = props => (
  <ActionButton
    title={props.translate('Refresh')}
    icon="fa fa-refresh"
    action={refreshResource}
  />
);

export const ResourceRefreshButton = withTranslation(PureResourceRefreshButton);

export default connectAngularComponent(ResourceRefreshButton);
