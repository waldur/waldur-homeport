// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  Customer,
  MarketplaceResourcesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const MarketplaceResourcesFilter: FunctionComponent<
  MarketplaceResourcesFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Organization')}
            loadOptions={createLoadOptions(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
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
          <AsyncSelect
            placeholder={translate('Project')}
            loadOptions={createLoadOptions(projectsList, 'query', {
              customer: props.organizationUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
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

export const MarketplaceResourcesFilterFormId = 'MarketplaceResourcesFilter';

interface MarketplaceResourcesFilterProps {
  organizationUuid?: any;
}

export interface MarketplaceResourcesFilterFormData {
  organization: Customer;
  project: Project;
}

type MarketplaceResourcesFilterQuery = MarketplaceResourcesListData['query'];

export const selectMarketplaceResourcesFilter = (
  values?: Partial<MarketplaceResourcesFilterFormData>,
): MarketplaceResourcesFilterQuery => {
  const filter: MarketplaceResourcesFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
  }
  return filter;
};
