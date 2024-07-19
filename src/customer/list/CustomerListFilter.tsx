import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';

interface CustomerListFilterProps {
  accountingPeriods: PeriodOption[];
}

const PureCustomerListFilter: FunctionComponent<CustomerListFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Accounting period')}
      name="accounting_period"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <AccountingPeriodField
        options={props.accountingPeriods}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Accounting running')}
      name="accounting_is_running"
      badgeValue={(value) => value?.label}
    >
      <AccountingRunningField reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
  </>
);

export const CustomerListFilter = reduxForm<{}, CustomerListFilterProps>({
  form: 'customerListFilter',
  destroyOnUnmount: false,
})(PureCustomerListFilter);
