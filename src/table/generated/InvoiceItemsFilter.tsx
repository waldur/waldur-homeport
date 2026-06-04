// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  InvoiceItemsListData,
  Project,
  ProviderOfferingDetails,
  customersList,
  marketplaceProviderOfferingsList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const InvoiceItemsFilter: FunctionComponent<InvoiceItemsFilterProps> = (
  props,
) => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Period')}
      name="accounting_period"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Period')}
      options={props.accountingPeriods}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
      placeholder={translate('Project')}
      loadOptions={createLoadOptions(projectsList, 'query')}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
      placeholder={translate('Offering')}
      loadOptions={createLoadOptions(marketplaceProviderOfferingsList, 'query')}
      defaultOptions
      getOptionValue={(option: ProviderOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: ProviderOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
    />
  </>
);

export const InvoiceItemsFilterFormId = 'InvoiceItemsFilter';

interface InvoiceItemsFilterProps {
  accountingPeriods?: any[];
}

export interface InvoiceItemsFilterFormData {
  organization: Customer;
  accounting_period: any;
  project: Project;
  offering: ProviderOfferingDetails;
}

type InvoiceItemsFilterQuery = InvoiceItemsListData['query'];

export const selectInvoiceItemsFilter = (
  values?: Partial<InvoiceItemsFilterFormData>,
): InvoiceItemsFilterQuery => {
  const filter: InvoiceItemsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.accounting_period) {
      Object.assign(filter, values.accounting_period.value);
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
