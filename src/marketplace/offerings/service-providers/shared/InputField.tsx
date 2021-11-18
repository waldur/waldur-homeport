import { FunctionComponent, ReactNode } from 'react';

import { FormField } from '@waldur/form/types';
import './InputField.scss';

const SearchIcon = require('./SearchIcon.svg');

interface InputFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  autoFocus?: boolean;
  iconPrefix?: ReactNode;
  type?: string;
  className?: string;
  value?: string;
  onChange?: any;
  onFocus?: any;
}

export const InputField: FunctionComponent<InputFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <input
      {...props.input}
      type="text"
      className="input form-control"
      style={{ backgroundImage: `url(${SearchIcon})` }}
      {...rest}
    />
  );
};
