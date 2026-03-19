import { FC } from 'react';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { formatBillingPeriod, getPreviousBillingPeriods } from './utils';

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

interface UsageMonitoringFilterProps {
  billingPeriod: string;
  onBillingPeriodChange: (period: string) => void;
}

export const UsageMonitoringFilter: FC<UsageMonitoringFilterProps> = ({
  billingPeriod,
  onBillingPeriodChange,
}) => {
  const selectedPeriod = billingPeriodOptions.find(
    (o) => o.value === billingPeriod,
  );

  return (
    <Select
      placeholder={translate('Billing period')}
      value={selectedPeriod}
      onChange={(option: BillingPeriodOption | null) =>
        option && onBillingPeriodChange(option.value)
      }
      options={billingPeriodOptions}
      isClearable={false}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};
