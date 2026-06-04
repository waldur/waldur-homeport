// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  InvoiceItemsListData,
  PublicOfferingDetails,
  Resource,
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const CreditUsageFilter: FunctionComponent<CreditUsageFilterProps> = (
  props,
) => (
  <>
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
      placeholder={translate('Offering')}
      loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query')}
      defaultOptions
      getOptionValue={(option: PublicOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: PublicOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Resource')}
      name="resource"
      getValueLabel={(value: Resource) => value?.name}
      placeholder={translate('Resource')}
      loadOptions={createLoadOptions(marketplaceResourcesList, 'query', {
        customer_uuid: props.customerUUID,
      })}
      defaultOptions
      getOptionValue={(option: Resource) => String(option.resource_uuid || '')}
      getOptionLabel={(option: Resource) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Year')}
      name="year"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Year')}
      options={props.yearOptions}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Month')}
      name="month"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Month')}
      options={props.monthOptions}
      isClearable={true}
    />
  </>
);

export const CreditUsageFilterFormId = 'CreditUsageFilter';

interface CreditUsageFilterProps {
  customerUUID?: any;
  monthOptions?: any[];
  yearOptions?: any[];
}

export interface CreditUsageFilterFormData {
  offering: PublicOfferingDetails;
  resource: Resource;
  year: any;
  month: any;
}

type CreditUsageFilterQuery = InvoiceItemsListData['query'];

export const selectCreditUsageFilter = (
  values?: Partial<CreditUsageFilterFormData>,
): CreditUsageFilterQuery => {
  const filter: CreditUsageFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
    if (values.resource) {
      filter.resource_uuid = values.resource.resource_uuid;
    }
    if (values.year) {
      filter.start_year = values.year.value;
    }
    if (values.month) {
      filter.start_month = values.month.value;
    }
  }
  return filter;
};
