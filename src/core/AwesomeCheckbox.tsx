import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC, useId } from 'react';
import { FormCheck, FormText } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

interface AwesomeCheckboxProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  value: boolean;
  onChange?(value: boolean): void;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  size?: 'sm';
  className?: string;
  id?: string;
  type?: 'switch' | 'checkbox';
}

export const AwesomeCheckbox: FC<AwesomeCheckboxProps> = ({
  type = 'switch',
  ...props
}) => {
  // Without an id of its own the checkbox takes the enclosing FormGroup's
  // controlId, which every checkbox in the group shares, so each label would
  // toggle the group's first box.
  const fallbackId = useId();
  const id = props.id ?? fallbackId;
  return (
    <label
      className={classNames(
        'form-check form-check-custom',
        type === 'switch'
          ? 'form-switch form-check-solid'
          : 'align-items-start',
        props.size === 'sm'
          ? type === 'switch'
            ? 'form-switch-sm'
            : 'form-check-sm'
          : '',
        props.className,
      )}
    >
      <FormCheck
        type="checkbox"
        id={id}
        checked={props.value}
        disabled={props.disabled}
        onChange={(e: React.ChangeEvent<any>) =>
          props.onChange && props.onChange(e.target.checked)
        }
        data-testid={props['data-testid']}
      />

      {(props.label || props.tooltip) && (
        <FormCheck.Label htmlFor={id}>
          {props.tooltip && (
            <>
              <Tooltip label={props.tooltip}>
                <QuestionIcon weight="bold" />
              </Tooltip>{' '}
            </>
          )}
          {props.label}
          {Boolean(props.description) && (
            <FormText>{props.description}</FormText>
          )}
        </FormCheck.Label>
      )}
    </label>
  );
};
