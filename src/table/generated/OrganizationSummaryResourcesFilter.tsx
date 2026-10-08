// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { MarketplaceResourcesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { DateFilter } from '@/table';

export const OrganizationSummaryResourcesFilter: FunctionComponent<{}> = () => (
  <>
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

export const OrganizationSummaryResourcesFilterFormId =
  'OrganizationSummaryResourcesFilter';

export interface OrganizationSummaryResourcesFilterFormData {
  created: string;
  created_before: string;
}

type OrganizationSummaryResourcesFilterQuery =
  MarketplaceResourcesListData['query'];

export const selectOrganizationSummaryResourcesFilter = (
  values?: Partial<OrganizationSummaryResourcesFilterFormData>,
): OrganizationSummaryResourcesFilterQuery => {
  const filter: OrganizationSummaryResourcesFilterQuery = {} as any;
  if (values) {
    if (values.created) {
      filter.created = values.created;
    }
    if (values.created_before) {
      filter.created_before = values.created_before;
    }
  }
  return filter;
};
