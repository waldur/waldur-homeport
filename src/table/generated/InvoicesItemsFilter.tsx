// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  InvoicesItemsRetrieveData,
  Project,
  PublicOfferingDetails,
  ServiceProvider,
  marketplacePublicOfferingsList,
  marketplaceServiceProvidersList,
  projectsList,
} from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureInvoicesItemsFilter: FunctionComponent<InvoicesItemsFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(value: ServiceProvider) => value?.customer_name}
    >
      <Field
        name="provider"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Service provider')}
            loadOptions={createSelectFetcher(
              marketplaceServiceProvidersList,
              'customer_keyword',
            )}
            defaultOptions
            getOptionValue={(option: ServiceProvider) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: ServiceProvider) =>
              String(option.customer_name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(projectsList, 'query', {
              customer: props.customerUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
    >
      <Field
        name="offering"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Offering')}
            loadOptions={createSelectFetcher(
              marketplacePublicOfferingsList,
              'query',
              { state: ['Active'] },
            )}
            defaultOptions
            getOptionValue={(option: PublicOfferingDetails) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: PublicOfferingDetails) =>
              String(option.name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Conceal compensation items')}
      name="conceal_compensation_items"
      badgeValue={(value) =>
        value ? translate('Conceal compensation items') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="conceal_compensation_items"
        component={AwesomeCheckboxField}
        label={translate('Conceal compensation items')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
  </>
);

export const InvoicesItemsFilterFormId = 'InvoicesItemsFilter';

interface InvoicesItemsFilterProps {
  customerUuid?: any;
}

export interface InvoicesItemsFilterFormData {
  provider: ServiceProvider;
  project: Project;
  offering: PublicOfferingDetails;
  conceal_compensation_items: boolean;
}

export const InvoicesItemsFilter = PureInvoicesItemsFilter;

type InvoicesItemsFilterQuery = InvoicesItemsRetrieveData['query'];

export const selectInvoicesItemsFilter = (
  values?: Partial<InvoicesItemsFilterFormData>,
): InvoicesItemsFilterQuery => {
  const filter: InvoicesItemsFilterQuery = {} as any;
  if (values) {
    if (values.provider) {
      filter.provider_uuid = values.provider.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
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
