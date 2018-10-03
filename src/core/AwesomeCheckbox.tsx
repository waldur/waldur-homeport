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
  label: React.ReactNode;
  id: string;
  value: boolean;
  onChange(value: boolean): void;
}

export const AwesomeCheckbox: React.SFC<AwesomeCheckboxProps> = (props: AwesomeCheckboxProps) => (
  <div className={classNames('checkbox', 'awesome-checkbox', `checkbox-${props.bsStyle}`, 'm-r-sm')}>
    <input
      type="checkbox"
      id={props.id}
      checked={props.value}
      onChange={event => props.onChange(event.target.checked)}/>
    <label htmlFor={props.id}>
      {props.label}
    </label>
  </div>
);

AwesomeCheckbox.defaultProps = {
  bsStyle: 'primary',
};
