import * as React from 'react';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';
import { FieldProps } from './types';

export const EnumField: React.FC<FieldProps> = props => {
  const { options } = props;
  const renderField = React.useCallback(
    fieldProps => <SelectControl options={options} input={fieldProps.input} />,
    [options],
  );
  return <DecoratedField {...props} component={renderField} />;
};
