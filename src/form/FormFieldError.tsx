import { Field } from 'react-final-form';

import { FieldError } from './FieldError';

interface FormFieldErrorProps {
  name: string;
}

export const FormFieldError = ({ name }: FormFieldErrorProps) => (
  <Field
    name={name}
    component={({ meta }) =>
      meta.touched && meta.error ? <FieldError error={meta.error} /> : null
    }
  />
);
