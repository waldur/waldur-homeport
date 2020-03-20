import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { translate } from '@waldur/i18n';

import { DecoratedField } from './DecoratedField';
import { FieldProps } from './types';

export const EnumField: React.FC<FieldProps> = props => (
  <DecoratedField
    {...props}
    component={fieldProps => (
      <FormControl componentClass="select" {...fieldProps.input}>
        <option>{translate('Select an option...')}</option>
        {(props.options || []).map((option, index) => (
          <option value={option} key={index}>
            {option}
          </option>
        ))}
      </FormControl>
    )}
  />
);
