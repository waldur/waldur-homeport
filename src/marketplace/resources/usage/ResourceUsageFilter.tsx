import { Field, reduxForm } from 'redux-form';

import { AccountingPeriodField } from '@waldur/customer/list/AccountingPeriodField';
import { StringField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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
