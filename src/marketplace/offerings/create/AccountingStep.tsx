import * as React from 'react';
import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';

import { PlansList } from '../plan/PlansList';
import { ComponentsList } from './ComponentsList';

interface AccountingStepProps {
  showComponents: boolean;
  type?: string;
  removeOfferingComponent(component: string): void;
  removeOfferingQuotas(component: string): void;
}

export const AccountingStep = (props: AccountingStepProps) => props.type ? (
  <>
    {props.showComponents && (
      <FieldArray
        name="components"
        component={ComponentsList}
        props={{
          removeOfferingComponent: props.removeOfferingComponent,
          removeOfferingQuotas: props.removeOfferingQuotas,
        }}
      />
    )}
    {props.showComponents && <hr/>}
    <FieldArray name="plans" component={PlansList} />
  </>
) : (
  <h3>{translate('Please select type in Management tab first.')}</h3>
);
