import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC } from 'react';

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
      <input
        className="form-check-input"
        type="checkbox"
        disabled={props.disabled}
        checked={props.value}
        onChange={(e: React.ChangeEvent<any>) =>
          props.onChange && props.onChange(e.target.checked)
        }
      />

      {(props.label || props.tooltip) && (
        <span className="form-check-label">
          {props.tooltip && (
            <>
              <Tip label={props.tooltip} id="tooltip">
                <QuestionIcon />
              </Tip>{' '}
            </>
          )}
          {props.label}
        </span>
      )}
    </label>
  );
};
