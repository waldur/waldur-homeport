import * as React from 'react';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';
import { FieldProps } from './types';

export const EnumField: React.FC<FieldProps> = props => (
  <DecoratedField
    {...props}
    component={fieldProps => (
      <SelectControl options={props.options} input={fieldProps.input} />
    )}
  />
);
