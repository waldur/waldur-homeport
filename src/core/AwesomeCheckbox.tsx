import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC } from 'react';
import { FormCheck } from 'react-bootstrap';

import { Tip } from './Tooltip';

interface AwesomeCheckboxProps {
  label?: React.ReactNode;
  value: boolean;
  onChange?(value: boolean): void;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  size?: 'sm';
  className?: string;
}

export const AwesomeCheckbox: FC<AwesomeCheckboxProps> = (props) => {
  return (
    <label
      className={classNames(
        'form-check form-switch form-check-custom form-check-solid',
        props.size === 'sm' && 'form-switch-sm',
        props.className,
      )}
    >
      <FormCheck
        type="checkbox"
        checked={props.value}
        disabled={props.disabled}
        onChange={(e: React.ChangeEvent<any>) =>
          props.onChange && props.onChange(e.target.checked)
        }
        data-testid={props['data-testid']}
      />

      {(props.label || props.tooltip) && (
        <span className="form-check-label">
          {props.tooltip && (
            <>
              <Tip label={props.tooltip} id="tooltip">
                <QuestionIcon weight="bold" />
              </Tip>{' '}
            </>
          )}
          {props.label}
        </span>
      )}
    </label>
  );
};
