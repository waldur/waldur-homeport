import * as React from 'react';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import { translate } from '@waldur/i18n';

export const NodeRoleField = props => (
  <ToggleButtonGroup
    value={props.input.value}
    onChange={props.input.onChange}
    name="role"
    type="checkbox"
  >
    <ToggleButton value="controlplane">
      {translate('Control plane')}
    </ToggleButton>
    <ToggleButton value="etcd">{translate('etcd')}</ToggleButton>
    <ToggleButton value="worker">{translate('Worker')}</ToggleButton>
  </ToggleButtonGroup>
);
