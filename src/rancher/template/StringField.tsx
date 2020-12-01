import React from 'react';
import { FormControl } from 'react-bootstrap';

import { FieldError } from '@waldur/form';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';

const renderControl = (props) => (
  <>
    <FormControl {...props.input} />
    {props.meta.error && props.meta.touched && (
      <FieldError error={props.meta.error} />
    )}
  </>
);

export const StringField: React.FC<FieldProps> = (props) => (
  <DecoratedField {...props} component={renderControl} />
);
