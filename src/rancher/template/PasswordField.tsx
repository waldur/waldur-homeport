import * as React from 'react';

import { SecretField } from '@waldur/form-react';

import { DecoratedField } from './DecoratedField';
import { FieldProps } from './types';

export const PasswordField: React.FC<FieldProps> = props => (
  <DecoratedField {...props} component={SecretField} />
);
