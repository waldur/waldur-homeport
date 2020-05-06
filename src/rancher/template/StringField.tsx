import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { FieldError } from '@waldur/form-react';

import { DecoratedField } from './DecoratedField';
import { FieldProps } from './types';

const renderControl = props => (
  <>
    <FormControl {...props.input} />
    {props.meta.error && props.meta.touched && (
      <FieldError error={props.meta.error} />
    )}
  </>
);

export const StringField: React.FC<FieldProps> = props => (
  <DecoratedField {...props} component={renderControl} />
);
