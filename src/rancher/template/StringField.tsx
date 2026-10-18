import React from 'react';

import { FieldError } from '@/form';
import { BaseInputField } from '@/form/InputField';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';

const renderControl = (props) => (
  <>
    <BaseInputField id={props.id} {...props.input} />
    {props.meta.error && props.meta.touched && (
      <FieldError error={props.meta.error} />
    )}
  </>
);

export const StringField: React.FC<FieldProps> = (props) => (
  <DecoratedField {...props} component={renderControl} />
);
