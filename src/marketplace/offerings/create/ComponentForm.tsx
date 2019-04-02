import * as React from 'react';

import { DisplayNameField } from '../DisplayNameField';
import { InternalNameField } from '../InternalNameField';
import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

interface Props {
  component: string;
  removeOfferingQuotas(): void;
}

export const ComponentForm = (props: Props) => (
  <>
    <InternalNameField name={`${props.component}.type`}/>
    <DisplayNameField name={`${props.component}.name`}/>
    <ComponentMeasuredUnitField component={props.component}/>
    <ComponentAccountingTypeField
      component={props.component}
      removeOfferingQuotas={props.removeOfferingQuotas}
    />
    <ComponentLimit component={props.component}/>
  </>
);
