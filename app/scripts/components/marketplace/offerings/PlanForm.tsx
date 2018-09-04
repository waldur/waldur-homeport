import * as React from 'react';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { OfferingPlanComponents } from './OfferingPlanComponents';
import { OfferingPlanFormGroup } from './OfferingPlanFormGroup';
import { PriceField } from './PriceField';
import { PriceUnitField } from './PriceUnitField';

export const PlanForm = withTranslation(props => (
  <>
    <Field
      name={`${props.plan}.name`}
      type="text"
      label={props.translate('Name')}
      component={OfferingPlanFormGroup}
    />
    <PriceField plan={props.plan}/>
    <PriceUnitField plan={props.plan}/>
    <OfferingPlanComponents plan={props.plan}/>
  </>
));
