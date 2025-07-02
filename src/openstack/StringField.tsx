import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { required } from '@waldur/core/validators';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormField: FC<WrappedFieldProps> = ({ input, meta, ...rest }) => (
  <FormControl value={input.value} onChange={input.onChange} {...rest} />
);

/** To use with `FieldArray` */
export const StringField = ({ name }) => (
  <Field name={name} component={FormField} as="input" validate={[required]} />
);
