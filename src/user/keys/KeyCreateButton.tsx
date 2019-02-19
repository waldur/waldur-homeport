import * as React from 'react';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

export const KeyCreateButton = props => (
  <ActionButton
    title={translate('Add key')}
    action={() => $state.go('keys.create')}
    tooltip={props.tooltip}
    icon="fa fa-plus"
    disabled={props.disabled}
  />
);
