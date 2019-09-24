import * as React from 'react';
import { formValues } from 'redux-form';

import { BillingType } from '@waldur/marketplace/types';

import { ComponentDisableQuotaField } from './ComponentDisableQuotaField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
import { ComponentLimitPeriodField, LimitPeriodOption } from './ComponentLimitPeriodField';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';

interface OwnProps {
  component: string;
}

interface Values {
  billingType: {
    value: BillingType
  };
  limitPeriod: LimitPeriodOption;
  disableQuotas: boolean;
}

const enhance = formValues(props => ({
  billingType: `${props.component}.billing_type`,
  limitPeriod: `${props.component}.limit_period`,
  disableQuotas: `${props.component}.disable_quotas`,
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
      {!props.disableQuotas && (
        <>
          <ComponentMinValueField component={props.component}/>
          <ComponentMaxValueField component={props.component}/>
        </>
      )}
    </>
  ) : null
)) as React.ComponentType<OwnProps>;
