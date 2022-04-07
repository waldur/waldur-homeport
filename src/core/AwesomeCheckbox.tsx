import React, { FunctionComponent } from 'react';

import { Tip } from './Tooltip';

interface AwesomeCheckboxProps {
  label: React.ReactNode;
  value: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
  tooltip?: React.ReactNode;
}

export const AwesomeCheckbox: FunctionComponent<AwesomeCheckboxProps> = (
  props,
) => {
  return (
    <label className="form-check form-switch form-check-custom form-check-solid">
      <input
        className="form-check-input"
        type="checkbox"
        disabled={props.disabled}
        checked={props.value}
        onChange={(e: React.ChangeEvent<any>) =>
          props.onChange(e.target.checked)
        }
      />
      <span className="form-check-label fw-bold">
        {props.tooltip && (
          <>
            <Tip label={props.tooltip} id="tooltip">
              <i className="fa fa-question-circle" />
            </Tip>{' '}
          </>
        )}
        {props.label}
      </span>
    </label>
  );
};
