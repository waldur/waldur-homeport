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
  ...rest
}) => (
  <BootstrapForm.Group as="td">
    <Component
      {...input}
      {...rest}
      isInvalid={touched && !!error}
      title={touched && error ? error : undefined}
      className="form-control"
    >
      {children}
    </Component>
  </BootstrapForm.Group>
);
