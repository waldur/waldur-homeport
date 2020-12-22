import classNames from 'classnames';
import uniqueId from 'lodash.uniqueid';
import React, { FunctionComponent } from 'react';

type BootstrapStyle = 'primary' | 'success' | 'info' | 'warning' | 'danger';

interface AwesomeCheckboxProps {
  bsStyle?: BootstrapStyle;
  marginRight?: boolean;
  label: React.ReactNode;
  value: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
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
        `checkbox-${props.bsStyle}`,
        { 'm-r-sm': props.marginRight },
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={props.value}
        onChange={(event) => props.onChange(event.target.checked)}
        disabled={props.disabled}
      />
      <label htmlFor={id}>{props.label}</label>
    </div>
  );
};

AwesomeCheckbox.defaultProps = {
  bsStyle: 'primary',
  marginRight: true,
};
