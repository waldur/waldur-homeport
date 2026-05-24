import { FC } from 'react';
import { Field } from 'react-final-form';

import { AccountingPeriodFieldComponent } from '@/customer/list/AccountingPeriodField';
import { StringField } from '@/form';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const RESOURCE_USAGE_FILTER_FORM_ID = 'ResourceUsageFilterForm';

const options = makeLastTwelveMonthsFilterPeriods();

export const ResourceUsageFilter: FC = () => {
  return (
    <>
      <TableFilterItem
        name="username"
        title={translate('Username')}
        instantApply={false}
      >
        <Field
          name="username"
          placeholder={translate('Search by username')}
          component={StringField}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Date')}
        name="billing_period"
        badgeValue={(value) => value?.label}
        ellipsis={false}
      >
        <Field
          name="billing_period"
          component={AccountingPeriodFieldComponent}
          options={options}
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
    </>
  );
};
