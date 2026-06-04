import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

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
  <SelectFilter
    title={translate('Billing period')}
    name="billing_period"
    badgeValue={(value) => value?.label}
    ellipsis={false}
    options={billingPeriodOptions}
    isClearable={false}
    placeholder={translate('Billing period')}
  />
);
