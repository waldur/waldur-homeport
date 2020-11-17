import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions as AccountingRunningFieldOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { SUPPORT_CUSTOMERS_FORM_ID } from '@waldur/customer/list/constants';
import { DivisionTypeFilter } from '@waldur/customer/list/DivisionTypeFilter';
import { SelectOrganizationDivisionField } from '@waldur/customer/list/SelectOrganizationDivisionField';
import {
  getOptions as ServiceProviderFilterOptions,
  ServiceProviderFilter,
} from '@waldur/customer/list/ServiceProviderFilter';
import { translate } from '@waldur/i18n';

export const PureSupportCustomerFilter = () => (
  <Row>
    <div className="form-group col-sm-3">
      <label className="control-label">{translate('Accounting running')}</label>
      <AccountingRunningField />
    </div>
    <ServiceProviderFilter />
    <SelectOrganizationDivisionField isFilterForm={true} />
    <DivisionTypeFilter />
  </Row>
);

export const SupportCustomerFilter = reduxForm<{}, any>({
  form: SUPPORT_CUSTOMERS_FORM_ID,
  initialValues: {
    accounting_is_running: AccountingRunningFieldOptions()[0],
    is_service_provider: ServiceProviderFilterOptions()[0],
  },
})(PureSupportCustomerFilter);
