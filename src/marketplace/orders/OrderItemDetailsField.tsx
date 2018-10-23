import * as React from 'react';

import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface OrderItemDetailsFieldProps {
  label?: string;
  children: React.ReactNode;
}

export const OrderItemDetailsField = (props: OrderItemDetailsFieldProps) => {
  const className = 'form-group row';
  const labelClassName = 'control-label col-sm-3 text-right';
  const valueClassName = 'col-sm-9 text-left';
  const classNameWithoutLabel = 'col-sm-offset-3 col-sm-9';

  return (
    <FormGroup
      className={className}
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={props.label}
      classNameWithoutLabel={!props.label && classNameWithoutLabel}>
        {props.children}
    </FormGroup>
  );
};
