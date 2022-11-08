import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';

interface CustomerListFilterProps {
  accountingPeriods: PeriodOption[];
}

export const PureCustomerListFilter: FunctionComponent<CustomerListFilterProps> =
  (props) => (
    <TableFilterFormContainer form="customerListFilter">
      <TableFilterItem
        title={translate('Accounting period')}
        name="accounting_period"
        badgeValue={(value) => value?.label}
        ellipsis={false}
      >
        <AccountingPeriodField options={props.accountingPeriods} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Accounting running')}
        name="accounting_is_running"
        badgeValue={(value) => value?.label}
      >
        <AccountingRunningField />
      </TableFilterItem>
    </TableFilterFormContainer>
  );

export const CustomerListFilter = reduxForm<{}, CustomerListFilterProps>({
  form: 'customerListFilter',
  destroyOnUnmount: false,
})(PureCustomerListFilter);
