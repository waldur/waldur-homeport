import { FC } from 'react';
import { reduxForm, Field } from 'redux-form';

import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

import {
  getCurrentBillingPeriod,
  formatBillingPeriod,
  getPreviousBillingPeriods,
} from './utils';

interface BillingPeriodOption {
  value: string;
  label: string;
}

const billingPeriodOptions: BillingPeriodOption[] = getPreviousBillingPeriods(
  6,
).map((period) => ({
  value: period,
  label: formatBillingPeriod(period),
}));

export const FORM_ID = 'UsageMonitoringFilter';

const PureUsageMonitoringFilter: FC = () => (
  <TableFilterItem
    title={translate('Billing period')}
    name="billing_period"
    badgeValue={(value) => value?.label}
    ellipsis={false}
  >
    <Field
      name="billing_period"
      component={SelectField}
      options={billingPeriodOptions}
      isClearable={false}
      placeholder={translate('Billing period')}
    />
  </TableFilterItem>
);

export const UsageMonitoringFilter = reduxForm({
  form: FORM_ID,
  initialValues: {
    billing_period:
      billingPeriodOptions.find((o) => o.value === getCurrentBillingPeriod()) ||
      billingPeriodOptions[0],
  },
  destroyOnUnmount: false,
})(PureUsageMonitoringFilter);
