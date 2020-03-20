import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { DecoratedField } from './DecoratedField';
import { FieldProps } from './types';

export const StringField: React.FC<FieldProps> = props => (
  <DecoratedField
    {...props}
    component={fieldProps => <FormControl {...fieldProps.input} />}
  />
);
