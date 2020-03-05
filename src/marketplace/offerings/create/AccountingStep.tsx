import * as React from 'react';
import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { PlansList } from '../plan/PlansList';

import { ComponentsList } from './ComponentsList';
import { OfferingLimitsTable } from './OfferingLimitsTable';

interface AccountingStepProps {
  showComponents: boolean;
  showLimits: boolean;
  type?: string;
  removeOfferingComponent(component: string): void;
  removeOfferingQuotas(component: string): void;
  builtinComponents: OfferingComponent[];
}

export const AccountingStep = (props: AccountingStepProps) =>
  props.type ? (
    <>
      {props.showLimits && props.builtinComponents.length > 0 && (
        <OfferingLimitsTable components={props.builtinComponents} />
      )}
      {props.showComponents && (
        <FieldArray
          name="components"
          component={ComponentsList}
          removeOfferingComponent={props.removeOfferingComponent}
          removeOfferingQuotas={props.removeOfferingQuotas}
        />
      )}
      {props.showComponents && <hr />}
      <FieldArray name="plans" component={PlansList} />
    </>
  ) : (
    <h3>{translate('Please select type in Management tab first.')}</h3>
  );
