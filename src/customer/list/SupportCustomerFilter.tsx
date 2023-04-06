import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions as AccountingRunningFieldOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { SUPPORT_CUSTOMERS_FORM_ID } from '@waldur/customer/list/constants';
import { DivisionTypeFilter } from '@waldur/customer/list/DivisionTypeFilter';
import { SelectOrganizationDivisionFieldPure } from '@waldur/customer/list/SelectOrganizationDivisionField';
import { ServiceProviderFilter } from '@waldur/customer/list/ServiceProviderFilter';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureSupportCustomerFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Accounting running')}
      name="accounting_is_running"
      badgeValue={(value) => value?.label}
    >
      <AccountingRunningField />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="is_service_provider"
      badgeValue={(value) => value?.label}
    >
      <ServiceProviderFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Division')}
      name="division"
      badgeValue={(value) => value?.name}
    >
      <SelectOrganizationDivisionFieldPure />
    </TableFilterItem>
    <TableFilterItem title={translate('Division type')} name="division_type">
      <DivisionTypeFilter />
    </TableFilterItem>
  </>
);

export const SupportCustomerFilter = reduxForm<{}, any>({
  form: SUPPORT_CUSTOMERS_FORM_ID,
  initialValues: {
    accounting_is_running: AccountingRunningFieldOptions()[0],
  },
  destroyOnUnmount: false,
})(PureSupportCustomerFilter);
