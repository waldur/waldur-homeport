import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field, FieldRenderProps } from 'react-final-form';

import { required } from '@/core/validators';

const FormField: FC<FieldRenderProps<string, any>> = ({ input, ...rest }) => (
  <FormControl value={input.value} onChange={input.onChange} {...rest} />
);

/** To use with `FieldArray` */
export const StringField = ({ name }) => (
  <Field name={name} component={FormField} validate={required} />
);
