import { formValues } from 'redux-form';

import { BillingType } from '@waldur/marketplace/types';

import { ComponentBooleanDefaultLimitField } from './ComponentBooleanDefaultLimitField';
import { ComponentBooleanLimitField } from './ComponentBooleanLimitField';
import { ComponentLimitAmountField } from './ComponentLimitAmountField';
import { ComponentLimitEnableField } from './ComponentLimitEnableField';
import {
  ComponentLimitPeriodField,
  LimitPeriodOption,
} from './ComponentLimitPeriodField';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';

interface Values {
  billingType: {
    value: BillingType;
  };
  limitPeriod: LimitPeriodOption;
  isBoolean: boolean;
  limitAmount?: number;
}

const enhance = formValues(() => ({
  billingType: 'billing_type',
  limitPeriod: 'limit_period',
  isBoolean: 'is_boolean',
  limitAmount: 'limit_amount',
}));

export const ComponentLimit = enhance((props: Values) => {
  const billingType = props.billingType?.value;
  if (billingType == 'limit') {
    if (props.isBoolean) {
      return (
        <>
          <ComponentBooleanLimitField />
          <ComponentBooleanDefaultLimitField />
        </>
      );
    } else {
      return (
        <>
          <ComponentBooleanLimitField />
          <ComponentMinValueField />
          <ComponentMaxValueField />
          <ComponentLimitPeriodField limitPeriod={props.limitPeriod} />
        </>
      );
    }
  } else if (billingType == 'usage') {
    if (typeof props.limitAmount === 'number') {
      return (
        <>
          <ComponentLimitEnableField />
          <ComponentLimitPeriodField limitPeriod={props.limitPeriod} />
          <ComponentLimitAmountField />
        </>
      );
    } else {
      return <ComponentLimitEnableField />;
    }
  }
  return null;
});
