import * as React from 'react';

import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface OrderItemDetailsFieldProps {
  label?: string;
}

export const OrderItemDetailsField: React.FC<OrderItemDetailsFieldProps> = props => (
  <FormGroup
    className="form-group row"
    labelClassName="control-label col-sm-3 text-right"
    valueClassName="col-sm-9 text-left"
    label={props.label}
    classNameWithoutLabel={!props.label && 'col-sm-offset-3 col-sm-9'}
  >
    {props.children}
  </FormGroup>
);
