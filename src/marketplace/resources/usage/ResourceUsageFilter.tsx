import { FC } from 'react';

import { AccountingPeriodFilter } from '@/customer/list/AccountingPeriodFilter';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { StringFilter } from '@/table';

export const RESOURCE_USAGE_FILTER_FORM_ID = 'ResourceUsageFilterForm';

const options = makeLastTwelveMonthsFilterPeriods();

export const ResourceUsageFilter: FC = () => {
  return (
    <>
      <StringFilter
        name="username"
        title={translate('Username')}
        instantApply={false}
        placeholder={translate('Search by username')}
      />
      <AccountingPeriodFilter
        name="billing_period"
        title={translate('Date')}
        options={options}
      />
    </>
  );
};
