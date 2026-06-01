import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
  tooltip?: ReactNode;
  tooltipEnd?: boolean;
  size?: 'sm';
  help_text?: ReactNode;
  disabled?: boolean;
  alignMiddle?: boolean;
  onChange?(v: boolean): void;
}

export const AwesomeCheckboxField: FunctionComponent<
  AwesomeCheckboxFieldProps
> = ({
  input,
  label,
  className,
  tooltip,
  tooltipEnd,
  help_text,
  alignMiddle,
  onChange,
  ...props
}) => {
  const id = props.id || 'check-' + input.name;
  return (
    <div
      className={classNames(
        'form-check form-switch form-check-custom form-check-solid',
        props.size === 'sm' && 'form-switch-sm',
        alignMiddle && 'align-items-center',
        className,
      )}
    >
      <Form.Check
        id={id}
        checked={input.checked ?? input.value}
        onChange={(e: React.ChangeEvent<any>) => {
          input.onChange(e.target.checked);
          if (onChange) onChange(e.target.checked);
        }}
        data-testid={props['data-testid']}
        disabled={props.readOnly || props.disabled}
      />

      {(tooltip || label || help_text) && (
        <Form.Check.Label htmlFor={id}>
          {tooltip && !tooltipEnd && (
            <Tip id={'form-field-tooltip-' + input.name} label={tooltip}>
              <QuestionIcon
                weight="bold"
                size={20}
                className="text-muted"
              />{' '}
            </Tip>
          )}
          {label}
          {help_text && <p className="text-muted">{help_text}</p>}
        </Form.Check.Label>
      )}
      {tooltip && tooltipEnd && (
        <Tip
          id={'form-field-tooltip-' + input.name}
          className="align-self-center ms-auto"
          label={tooltip}
        >
          <QuestionIcon weight="bold" size={20} className="text-muted" />
        </Tip>
      )}
    </div>
  );
};
