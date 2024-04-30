import React from 'react';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

interface EnumFieldProps extends FieldProps {
  getLabel?(option: any): string;
  getValue?(option: any): string;
  options?: any[];
}

export const EnumField: React.FC<EnumFieldProps> = ({
  getLabel = (option) => option,
  getValue = (option) => option,
  options,
  ...props
}) => {
  const renderField = React.useCallback(
    (fieldProps) => (
      <SelectControl
        options={options}
        input={fieldProps.input}
        getLabel={getLabel}
        getValue={getValue}
      />
    ),
    [options, getLabel, getValue],
  );
  return <DecoratedField {...props} component={renderField} />;
};
