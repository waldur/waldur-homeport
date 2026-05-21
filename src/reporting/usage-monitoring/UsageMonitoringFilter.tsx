import { FC } from 'react';
import { Field } from 'react-final-form';

import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

import { formatBillingPeriod, getPreviousBillingPeriods } from './utils';

interface BillingPeriodOption {
  value: string;
  label: string;
}

export const billingPeriodOptions: BillingPeriodOption[] =
  getPreviousBillingPeriods(6).map((period) => ({
    value: period,
    label: formatBillingPeriod(period),
  }));

export const FORM_ID = 'UsageMonitoringFilter';

export const UsageMonitoringFilter: FC = () => (
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
