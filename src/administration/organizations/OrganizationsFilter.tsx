import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { OrganizationGroupFilter } from '@waldur/administration/organizations/OrganizationGroupFilter';
import { AccountingRunningField } from '@waldur/customer/list/AccountingRunningField';
import { SelectOrganizationGroupFieldPure } from '@waldur/customer/list/SelectOrganizationGroupField';
import { ServiceProviderFilter } from '@waldur/customer/list/ServiceProviderFilter';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { CUSTOMERS_FILTER_FORM_ID } from '@waldur/user/constants';

const PureSupportCustomerFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Accounting running')}
      name="accounting_is_running"
      badgeValue={(value) => value?.label}
    >
      <AccountingRunningField reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="is_service_provider"
      badgeValue={(value) => value?.label}
    >
      <ServiceProviderFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization group')}
      name="organization_group"
      badgeValue={(value) => value?.name}
    >
      <SelectOrganizationGroupFieldPure
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization group type')}
      name="organization_group_type"
      getValueLabel={(option) => option.name}
    >
      <OrganizationGroupFilter />
    </TableFilterItem>
  </>
);

export const OrganizationsFilter = reduxForm<{}, any>({
  form: CUSTOMERS_FILTER_FORM_ID,
  destroyOnUnmount: false,
})(PureSupportCustomerFilter);
