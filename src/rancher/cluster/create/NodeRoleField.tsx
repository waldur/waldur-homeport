import { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const NodeRoleField: FunctionComponent<any> = (props) => (
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
