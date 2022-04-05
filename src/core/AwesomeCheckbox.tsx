import classNames from 'classnames';
import { uniqueId } from 'lodash';
import React, { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

type BootstrapStyle = 'primary' | 'success' | 'info' | 'warning' | 'danger';

interface AwesomeCheckboxProps {
  variant?: BootstrapStyle;
  marginRight?: boolean;
  label: React.ReactNode;
  value: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
  tooltip?: React.ReactNode;
}

export const AwesomeCheckbox: FunctionComponent<AwesomeCheckboxProps> = (
  props,
) => {
  const [id] = React.useState(uniqueId('checkbox-'));
  return (
    <div
      className={classNames(
        'checkbox',
        'awesome-checkbox',
        `checkbox-${props.variant}`,
        { 'me-2': props.marginRight },
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={props.value}
        onChange={(event) => props.onChange(event.target.checked)}
        disabled={props.disabled}
      />
      <label htmlFor={id}>
        {props.tooltip && (
          <>
            <Tip label={props.tooltip} id={`awesome-checkbox-tooltip-${id}`}>
              <i className="fa fa-question-circle" />
            </Tip>{' '}
          </>
        )}
        {props.label}
      </label>
    </div>
  );
};

AwesomeCheckbox.defaultProps = {
  variant: 'primary',
  marginRight: true,
};
