import { FunctionComponent } from 'react';

import { CheckLabelProps, Switch } from 'waldur-ui';

import { FormField } from './types';

interface SwitchFieldProps
  extends FormField, Pick<CheckLabelProps, 'align' | 'inline'> {
  className?: string;
  size?: 'sm' | 'md';
  /** Names a switch that has no visible `label`. */
  'aria-label'?: string;
  /** Called with the new value after the form has been told. */
  onChange?(value: boolean): void;
}

/**
 * A react-final-form boolean as a waldur-ui `Switch`: `input.value` in,
 * `input.onChange(boolean)` out, `readOnly` or `disabled` locks it. The
 * label, description and tooltip are the Switch's own (see BooleanGroup,
 * which hands them over instead of drawing them in its FormGroup).
 */
export const SwitchField: FunctionComponent<SwitchFieldProps> = ({
  input,
  label,
  description,
  tooltip,
  align,
  inline,
  size,
  className,
  onChange,
  id,
  readOnly,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => (
  <Switch
    id={id}
    checked={Boolean(input.checked ?? input.value)}
    onCheckedChange={(checked) => {
      input.onChange(checked);
      onChange?.(checked);
    }}
    disabled={readOnly || disabled}
    label={label}
    description={description}
    tooltip={tooltip}
    align={align}
    inline={inline}
    size={size}
    className={className}
    aria-label={ariaLabel}
    data-testid={testId}
  />
);
