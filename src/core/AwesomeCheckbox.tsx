import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC } from 'react';
import { FormCheck, FormText } from 'react-bootstrap';

import { Tip } from './Tooltip';

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
        id={props.id}
        checked={props.value}
        disabled={props.disabled}
        onChange={(e: React.ChangeEvent<any>) =>
          props.onChange && props.onChange(e.target.checked)
        }
        data-testid={props['data-testid']}
      />

      {(props.label || props.tooltip) && (
        <FormCheck.Label htmlFor={props.id}>
          {props.tooltip && (
            <>
              <Tip label={props.tooltip} id="tooltip">
                <QuestionIcon weight="bold" />
              </Tip>{' '}
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
