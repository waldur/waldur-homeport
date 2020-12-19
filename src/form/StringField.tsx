import { FunctionComponent } from 'react';

import { FormField } from './types';

interface StringFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
}

export const StringField: FunctionComponent<StringFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <input {...props.input} type="text" className="form-control" {...rest} />
  );
};
