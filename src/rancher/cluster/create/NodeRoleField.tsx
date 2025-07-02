import { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const NodeRoleField: FunctionComponent<any> = (props) => (
  <ToggleButtonGroup
    value={props.input.value}
    onChange={props.input.onChange}
    name="role"
    type="radio"
  >
    <ToggleButton value="agent" id="agent">
      {translate('Agent')}
    </ToggleButton>
    <ToggleButton value="server" id="server">
      {translate('Server')}
    </ToggleButton>
  </ToggleButtonGroup>
);
