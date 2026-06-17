import { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { translate } from '@/i18n';

export const NodeRoleField: FunctionComponent<FieldRenderProps<string>> = ({
  input,
}) => (
  <ToggleButtonGroup
    value={input.value}
    onChange={input.onChange}
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
