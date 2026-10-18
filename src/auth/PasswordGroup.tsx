import { FC } from 'react';

import { BaseSecretField } from '@/form/SecretField';
import { withFormGroup } from '@/form/withFormGroup';

interface PasswordFieldProps {
  placeholder?: string;
  autoFocus?: boolean;
  input?: any;
  id?: string;
}

const PasswordField: FC<PasswordFieldProps> = ({
  placeholder,
  input,
  id,
  autoFocus = false,
}) => (
  <BaseSecretField
    id={id}
    placeholder={placeholder}
    inputClassName="login-input"
    autoFocus={autoFocus}
    {...input}
  />
);

export const PasswordGroup = withFormGroup(PasswordField);
