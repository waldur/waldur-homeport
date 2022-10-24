import { FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';

import { FormField } from './types';

interface InputFieldProps extends FormField {
  className?: string;
}

export const InputField: FunctionComponent<InputFieldProps> = ({
  input,
  className,
  ...props
}) => (
  <FormControl className={className} placeholder="  " {...input} {...props} />
);

InputField.defaultProps = {
  className: 'form-control-solid',
};
