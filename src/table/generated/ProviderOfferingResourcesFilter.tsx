// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  MarketplaceProviderResourcesListData,
  Project,
  ProviderPlanDetails,
  customersList,
  marketplacePlansList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter, DateFilter } from '@/table';

export const ProviderOfferingResourcesFilter: FunctionComponent<
  ProviderOfferingResourcesFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Client organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Client organization')}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
      loadOptions={createLoadOptions(projectsList, 'query', {
        customer: props.organizationUuid,
      })}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Project')}
    />
    <AsyncSelectFilter
      title={translate('Plan')}
      name="plan"
      getValueLabel={(value: ProviderPlanDetails) => value?.name}
      loadOptions={createLoadOptions(marketplacePlansList, null as any, {
        offering_uuid: props.offeringUuid,
      })}
      defaultOptions
      getOptionValue={(option: ProviderPlanDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: ProviderPlanDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      placeholder={translate('Plan')}
    />
    <BooleanFilter
      title={translate('Paused')}
      name="paused"
      badgeValue={(value) => (value ? translate('Paused') : translate('All'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <BooleanFilter
      title={translate('Downscaled')}
      name="downscaled"
      badgeValue={(value) =>
        value ? translate('Downscaled') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <BooleanFilter
      title={translate('Restrict member access')}
      name="restrict_member_access"
      badgeValue={(value) =>
        value ? translate('Restrict member access') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <DateFilter
      title={translate('Created after')}
      name="created"
      placeholder={translate('Created after')}
    />
    <DateFilter
      title={translate('Created before')}
      name="created_before"
      placeholder={translate('Created before')}
    />
  </>
);

export const ProviderOfferingResourcesFilterFormId =
  'ProviderOfferingResourcesFilter';

interface ProviderOfferingResourcesFilterProps {
  offeringUuid?: any;
  organizationUuid?: any;
}

export interface ProviderOfferingResourcesFilterFormData {
  organization: Customer;
  project: Project;
  plan: ProviderPlanDetails;
  paused: boolean;
  downscaled: boolean;
  restrict_member_access: boolean;
  created: string;
  created_before: string;
}

type ProviderOfferingResourcesFilterQuery =
  MarketplaceProviderResourcesListData['query'];

export const selectProviderOfferingResourcesFilter = (
  values?: Partial<ProviderOfferingResourcesFilterFormData>,
): ProviderOfferingResourcesFilterQuery => {
  const filter: ProviderOfferingResourcesFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
    if (values.plan) {
      filter.plan_uuid = values.plan.uuid;
    }
    if (values.paused) {
      filter.paused = values.paused;
    }
    if (values.downscaled) {
      filter.downscaled = values.downscaled;
    }
    if (values.restrict_member_access) {
      filter.restrict_member_access = values.restrict_member_access;
    }
    if (values.created) {
      filter.created = values.created;
    }
    if (values.created_before) {
      filter.created_before = values.created_before;
    }
  }
  return filter;
};
