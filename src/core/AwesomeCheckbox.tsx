import * as classNames from 'classnames';
import * as React from 'react';

type BootstrapStyle =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
;

interface AwesomeCheckboxProps {
  bsStyle?: BootstrapStyle;
  marginRight?: boolean;
  label: React.ReactNode;
  id: string;
  value: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
}

export const AwesomeCheckbox: React.SFC<AwesomeCheckboxProps> = (props: AwesomeCheckboxProps) => (
  <div className={
    classNames('checkbox', 'awesome-checkbox', `checkbox-${props.bsStyle}`,
      {'m-r-sm': props.marginRight}
    )}
  >
    <input
      type="checkbox"
      id={props.id}
      checked={props.value}
      onChange={event => props.onChange(event.target.checked)}
      disabled={props.disabled}
    />
    <label htmlFor={props.id}>
      {props.label}
    </label>
  </div>
);

AwesomeCheckbox.defaultProps = {
  bsStyle: 'primary',
  marginRight: true,
};
