import { useMemo, FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const HookTypeField: FunctionComponent<{ input; defaultValue }> = ({
  input,
  defaultValue,
}) => {
  const options = useMemo(
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
      {options.map((option) => (
        <ToggleButton key={option.key} value={option.key}>
          <i className={option.iconClass} /> {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
