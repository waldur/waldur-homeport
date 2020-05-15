import * as React from 'react';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

interface EnumFieldProps extends FieldProps {
  getLabel?(option: any): string;
  getValue?(option: any): string;
  options?: any[];
}

export const EnumField: React.FC<EnumFieldProps> = props => {
  const { options } = props;
  const renderField = React.useCallback(
    fieldProps => (
      <SelectControl
        options={options}
        input={fieldProps.input}
        getLabel={props.getLabel}
        getValue={props.getValue}
      />
    ),
    [options, props.getLabel, props.getValue],
  );
  return <DecoratedField {...props} component={renderField} />;
};

EnumField.defaultProps = {
  getLabel: option => option,
  getValue: option => option,
};
