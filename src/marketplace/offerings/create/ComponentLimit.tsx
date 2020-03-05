import * as React from 'react';
import { formValues } from 'redux-form';

import { BillingType } from '@waldur/marketplace/types';

import { ComponentDisableQuotaField } from './ComponentDisableQuotaField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
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
}

const enhance = formValues(() => ({
  billingType: 'billing_type',
  limitPeriod: 'limit_period',
  disableQuotas: 'disable_quotas',
}));

export const ComponentLimit = enhance((props: Values) =>
  props.billingType && props.billingType.value === 'usage' ? (
    <>
      <ComponentLimitPeriodField limitPeriod={props.limitPeriod} />
      <ComponentLimitAmountField />
      <ComponentDisableQuotaField />
      {!props.disableQuotas && (
        <>
          <ComponentMinValueField />
          <ComponentMaxValueField />
        </>
      )}
      <ComponentUseLimitForBillingField />
    </>
  ) : null,
) as React.ComponentType<{}>;
