import { EnvelopeSimpleIcon, LinkSimpleIcon } from '@phosphor-icons/react';
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
        iconClass: <EnvelopeSimpleIcon weight="bold" />,
      },
      {
        key: 'webhook',
        label: translate('Webhook'),
        iconClass: <LinkSimpleIcon weight="bold" />,
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
        <ToggleButton
          key={option.key}
          id={option.key}
          value={option.key}
          variant="tertiary"
        >
          <span className="svg-icon svg-icon-2 me-3">{option.iconClass}</span>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
