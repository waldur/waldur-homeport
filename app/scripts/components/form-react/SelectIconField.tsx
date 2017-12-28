import * as React from 'react';

import { optionRenderer, IconGetter } from './optionRenderer';
import { SelectField, SelectFieldProps } from './SelectField';

interface SelectIconFieldProps extends SelectFieldProps {
  iconKey: string | IconGetter;
  labelKey: string;
}

export const SelectIconField = (props: SelectIconFieldProps) => {
  const renderer = optionRenderer(props);
  return (
    <SelectField
      optionRenderer={renderer}
      valueRenderer={renderer}
      {...props}
    />
  );
};
