import { formValues } from 'redux-form';
import { BillingTypeEnum } from 'waldur-js-client';

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
    value: BillingTypeEnum;
  };
  limitPeriod: LimitPeriodOption;
  isBoolean: boolean;
  limitAmount?: number;
}

const enhance = formValues<any, { readOnly?: boolean }>(() => ({
  billingType: 'billing_type',
  limitPeriod: 'limit_period',
  isBoolean: 'is_boolean',
  limitAmount: 'limit_amount',
}));

export const ComponentLimit = enhance(
  (props: Values & { readOnly?: boolean }) => {
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
            <ComponentLimitPeriodField
              limitPeriod={props.limitPeriod}
              readOnly={props.readOnly}
            />
          </>
        );
      }
    } else if (billingType == 'usage') {
      if (typeof props.limitAmount === 'number') {
        return (
          <>
            <ComponentLimitEnableField />
            <ComponentLimitPeriodField
              limitPeriod={props.limitPeriod}
              readOnly={props.readOnly}
            />

            <ComponentLimitAmountField />
          </>
        );
      } else {
        return <ComponentLimitEnableField />;
      }
    }
    return null;
  },
);
