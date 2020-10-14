import * as classNames from 'classnames';
import _uniqueId from 'lodash.uniqueid';
import * as React from 'react';

type BootstrapStyle = 'primary' | 'success' | 'info' | 'warning' | 'danger';

interface AwesomeCheckboxProps {
  bsStyle?: BootstrapStyle;
  marginRight?: boolean;
  label: React.ReactNode;
  value: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
}

export const AwesomeCheckbox: React.FC<AwesomeCheckboxProps> = (
  props: AwesomeCheckboxProps,
) => {
  const [id] = React.useState(_uniqueId('checkbox-'));
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
