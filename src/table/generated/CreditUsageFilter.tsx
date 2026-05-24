// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  InvoiceItemsListData,
  PublicOfferingDetails,
  Resource,
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const CreditUsageFilter: FunctionComponent<CreditUsageFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
    >
      <Field
        name="offering"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Offering')}
            loadOptions={createLoadOptions(
              marketplacePublicOfferingsList,
              'query',
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
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Resource')}
      name="resource"
      getValueLabel={(value: Resource) => value?.name}
    >
      <Field
        name="resource"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Resource')}
            loadOptions={createLoadOptions(marketplaceResourcesList, 'query', {
              customer_uuid: props.customerUUID,
            })}
            defaultOptions
            getOptionValue={(option: Resource) =>
              String(option.resource_uuid || '')
            }
            getOptionLabel={(option: Resource) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Year')}
      name="year"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="year"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Year')}
            options={props.yearOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Month')}
      name="month"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="month"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Month')}
            options={props.monthOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
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
