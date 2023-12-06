import React from 'react';

import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface DetailsFieldProps {
  label?: string;
}

export const DetailsField: React.FC<DetailsFieldProps> = (props) => (
  <FormGroup
    labelClassName="col-sm-3 text-right"
    valueClassName="col-sm-9 text-left"
    label={props.label}
    classNameWithoutLabel={!props.label && 'offset-sm-3 col-sm-9'}
  >
    {props.children}
  </FormGroup>
);
