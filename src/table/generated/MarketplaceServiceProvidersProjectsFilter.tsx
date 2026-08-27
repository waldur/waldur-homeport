// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { MarketplaceServiceProvidersProjectsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter } from '@/table';

export const MarketplaceServiceProvidersProjectsFilter: FunctionComponent<{}> =
  () => (
    <BooleanFilter
      title={translate('Conceal finished projects')}
      name="conceal_finished_projects"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  );

export const MarketplaceServiceProvidersProjectsFilterFormId =
  'MarketplaceServiceProvidersProjectsFilter';

export interface MarketplaceServiceProvidersProjectsFilterFormData {
  conceal_finished_projects: boolean;
}

type MarketplaceServiceProvidersProjectsFilterQuery =
  MarketplaceServiceProvidersProjectsListData['query'];

export const selectMarketplaceServiceProvidersProjectsFilter = (
  values?: Partial<MarketplaceServiceProvidersProjectsFilterFormData>,
): MarketplaceServiceProvidersProjectsFilterQuery => {
  const filter: MarketplaceServiceProvidersProjectsFilterQuery = {} as any;
  if (values) {
    if (values.conceal_finished_projects) {
      filter.conceal_finished_projects = values.conceal_finished_projects;
    }
  }
  return filter;
};
