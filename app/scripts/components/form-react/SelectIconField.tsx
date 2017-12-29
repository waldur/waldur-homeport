import * as React from 'react';

import { optionRenderer, RendererConfig } from './optionRenderer';
import { SelectField, SelectFieldProps } from './SelectField';

interface SelectIconFieldProps extends SelectFieldProps, RendererConfig {
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
