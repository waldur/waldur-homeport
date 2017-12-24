import * as React from 'react';

import { SelectField, SelectFieldProps } from './SelectField';

interface SelectIconFieldProps extends SelectFieldProps {
  iconKey: string;
}

const optionRenderer = (iconKey, labelKey) => option => (
  <div>
    <img src={option[iconKey]} style={{
      display: 'inline-block',
      marginRight: 10,
      position: 'relative',
      top: -2,
      verticalAlign: 'middle',
    }}/>
    {option[labelKey]}
  </div>
);

export const SelectIconField = (props: SelectIconFieldProps) => {
  const renderer = optionRenderer(props.iconKey, props.labelKey);
  return (
    <SelectField
      optionRenderer={renderer}
      valueRenderer={renderer}
      {...props}
    />
  );
};
