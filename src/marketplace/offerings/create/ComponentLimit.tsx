import * as React from 'react';
import { formValues } from 'redux-form';

import { BillingType } from '@waldur/marketplace/types';

import { ComponentDisableQuotaField } from './ComponentDisableQuotaField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
import { ComponentLimitPeriodField, LimitPeriodOption } from './ComponentLimitPeriodField';

interface OwnProps {
  component: string;
}

interface Values {
  billingType: {
    value: BillingType
  };
  limitPeriod: LimitPeriodOption;
}

const enhance = formValues(props => ({
  billingType: `${props.component}.billing_type`,
  limitPeriod: `${props.component}.limit_period`,
}));

export const ComponentLimit = enhance((props: Values & OwnProps) => (
  props.billingType && props.billingType.value === 'usage' ? (
    <>
      <ComponentLimitPeriodField
        component={props.component}
        limitPeriod={props.limitPeriod}
      />
      <ComponentLimitAmountField component={props.component}/>
      <ComponentDisableQuotaField component={props.component}/>
    </>
  ) : null
)) as React.ComponentType<OwnProps>;
