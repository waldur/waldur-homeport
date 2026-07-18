// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  InvoicesItemsRetrieveData,
  Project,
  PublicOfferingDetails,
  ServiceProvider,
  marketplacePublicOfferingsList,
  marketplaceServiceProvidersList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter } from '@/table';

export const InvoicesItemsFilter: FunctionComponent<
  InvoicesItemsFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(value: ServiceProvider) => value?.customer_name}
      placeholder={translate('Service provider')}
      loadOptions={createLoadOptions(
        marketplaceServiceProvidersList,
        'customer_keyword',
      )}
      defaultOptions
      getOptionValue={(option: ServiceProvider) => String(option.uuid || '')}
      getOptionLabel={(option: ServiceProvider) =>
        String(option.customer_name || '')
      }
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project_uuid"
      getValueLabel={(value: Project) => value?.name}
      placeholder={translate('Project')}
      loadOptions={createLoadOptions(projectsList, 'query', {
        customer: props.customerUuid,
      })}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
      placeholder={translate('Offering')}
      loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query', {
        state: ['Active'],
      })}
      defaultOptions
      getOptionValue={(option: PublicOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: PublicOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
    />
    <BooleanFilter
      title={translate('Conceal compensation items')}
      name="conceal_compensation_items"
      badgeValue={(value) =>
        value ? translate('Conceal compensation items') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const InvoicesItemsFilterFormId = 'InvoicesItemsFilter';

interface InvoicesItemsFilterProps {
  customerUuid?: any;
}

export interface InvoicesItemsFilterFormData {
  provider: ServiceProvider;
  project_uuid: Project;
  offering: PublicOfferingDetails;
  conceal_compensation_items: boolean;
}

type InvoicesItemsFilterQuery = InvoicesItemsRetrieveData['query'];

export const selectInvoicesItemsFilter = (
  values?: Partial<InvoicesItemsFilterFormData>,
): InvoicesItemsFilterQuery => {
  const filter: InvoicesItemsFilterQuery = {} as any;
  if (values) {
    if (values.provider) {
      filter.provider_uuid = values.provider.uuid;
    }
    if (values.project_uuid) {
      filter.project_uuid = values.project_uuid.uuid;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
    if (values.conceal_compensation_items) {
      filter.conceal_compensation_items = values.conceal_compensation_items;
    }
  }
  return filter;
};
