import { Field, reduxForm } from 'redux-form';

import { AccountingPeriodField } from '@/customer/list/AccountingPeriodField';
import { StringField } from '@/form';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

const options = makeLastTwelveMonthsFilterPeriods();

const PureResourceUsageFilter = () => {
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
        <AccountingPeriodField
          options={options}
          name="billing_period"
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: 'ResourceUsageFilterForm',
  destroyOnUnmount: false,
});

export const ResourceUsageFilter = enhance(PureResourceUsageFilter);
