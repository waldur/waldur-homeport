import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { AccountingPeriodField } from '@waldur/customer/list/AccountingPeriodField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

interface SupportInvoiceItemsFilterProps {
  accountingPeriods: PeriodOption[];
}

const PureSupportInvoiceItemsFilter: FunctionComponent<
  SupportInvoiceItemsFilterProps
> = ({ accountingPeriods }) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Period')}
      name="accounting_period"
      badgeValue={(value) => value?.label}
    >
      <AccountingPeriodField
        options={accountingPeriods}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
  </>
);

export const SupportInvoiceItemsFilter = reduxForm<
  {},
  SupportInvoiceItemsFilterProps
>({
  form: 'SupportInvoiceItemsFilter',
  destroyOnUnmount: false,
})(PureSupportInvoiceItemsFilter);
