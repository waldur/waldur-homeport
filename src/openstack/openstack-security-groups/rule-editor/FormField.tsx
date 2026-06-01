import { FC } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';

interface FormFieldProps {
  input: any;
  meta: { error?: string; touched?: boolean };
  as?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export const FormField: FC<FormFieldProps> = ({
  input,
  meta: { error, touched },
  as: Component = BootstrapForm.Control,
  children,
  'aria-label': ariaLabel,
  ...rest
}) => (
  <BootstrapForm.Group as="td">
    <Component
      {...input}
      {...rest}
      isInvalid={touched && !!error}
      title={touched && error ? error : undefined}
      className="form-control"
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  </BootstrapForm.Group>
);
