import * as React from 'react';
import { formValues } from 'redux-form';

import { BillingType } from '@waldur/marketplace/types';

import { ComponentBooleanDefaultLimitField } from './ComponentBooleanDefaultLimitField';
import { ComponentBooleanLimitField } from './ComponentBooleanLimitField';
import { ComponentDisableQuotaField } from './ComponentDisableQuotaField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
import { ComponentLimitEnableField } from './ComponentLimitEnableField';
import {
  ComponentLimitPeriodField,
  LimitPeriodOption,
} from './ComponentLimitPeriodField';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';
import { ComponentUseLimitForBillingField } from './ComponentUseLimitForBillingField';

interface Values {
  billingType: {
    value: BillingType;
  };
  limitPeriod: LimitPeriodOption;
  disableQuotas: boolean;
  isBoolean: boolean;
  limitAmount?: number;
}

const enhance = formValues(() => ({
  billingType: 'billing_type',
  limitPeriod: 'limit_period',
  disableQuotas: 'disable_quotas',
  isBoolean: 'is_boolean',
  limitAmount: 'limit_amount',
}));

export const ComponentLimit = enhance((props: Values) => {
  if (props.billingType?.value !== 'usage') {
    return null;
  }

  if (props.isBoolean) {
    return (
      <>
        <ComponentBooleanLimitField />
        <ComponentBooleanDefaultLimitField />
      </>
    );
  }

  return (
    <>
      <ComponentBooleanLimitField />
      <ComponentLimitEnableField />
      {props.limitAmount !== null && (
        <>
          <ComponentLimitPeriodField limitPeriod={props.limitPeriod} />
          <ComponentLimitAmountField />
        </>
      )}
      <ComponentDisableQuotaField />
      {!props.disableQuotas && (
        <>
          <ComponentMinValueField />
          <ComponentMaxValueField />
          <ComponentUseLimitForBillingField />
        </>
      )}
    </>
  );
}) as React.ComponentType<{}>;
