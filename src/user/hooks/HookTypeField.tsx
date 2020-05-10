import * as React from 'react';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import { translate } from '@waldur/i18n';

export const HookTypeField = ({ input, defaultValue }) => {
  const options = React.useMemo(
    () => [
      {
        key: 'email',
        label: translate('Email'),
        iconClass: 'fa fa-envelope-o',
      },
      {
        key: 'webhook',
        label: translate('Webhook'),
        iconClass: 'fa fa-link',
      },
    ],
    [],
  );
  return (
    <ToggleButtonGroup
      name="hook_type"
      type="radio"
      defaultValue={defaultValue}
      value={input.value}
      onChange={input.onChange}
    >
      {options.map(option => (
        <ToggleButton key={option.key} value={option.key}>
          <i className={option.iconClass} /> {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
