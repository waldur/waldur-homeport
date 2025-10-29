import { Field } from 'react-final-form';

import { FieldError } from './FieldError';

interface FormFieldErrorProps {
  name: string;
}

export const FormFieldError = ({ name }: FormFieldErrorProps) => (
  <Field
    name={name}
    component={({ meta }) =>
      meta.touched && (meta.error || meta.submitError) ? (
        <FieldError error={meta.error || meta.submitError} />
      ) : null
    }
  />
);
