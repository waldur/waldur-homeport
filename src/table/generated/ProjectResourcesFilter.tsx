// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplaceResourcesListData,
  PublicOfferingDetails,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const ProjectResourcesFilter: FunctionComponent<
  ProjectResourcesFilterProps
> = (props) => (
  <AsyncSelectFilter
    title={translate('Offering')}
    name="offering"
    getValueLabel={(value: PublicOfferingDetails) => value?.name}
    placeholder={translate('Offering')}
    loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query', {
      project_uuid: props.project.uuid,
    })}
    defaultOptions
    getOptionValue={(option: PublicOfferingDetails) =>
      String(option.uuid || '')
    }
    getOptionLabel={(option: PublicOfferingDetails) =>
      String(option.name || '')
    }
    isClearable={true}
    isMulti={true}
  />
);

export const ProjectResourcesFilterFormId = 'ProjectResourcesFilter';

interface ProjectResourcesFilterProps {
  project?: any;
}

export interface ProjectResourcesFilterFormData {
  offering: PublicOfferingDetails[];
}

type ProjectResourcesFilterQuery = MarketplaceResourcesListData['query'];

export const selectProjectResourcesFilter = (
  values?: Partial<ProjectResourcesFilterFormData>,
): ProjectResourcesFilterQuery => {
  const filter: ProjectResourcesFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.map((v: any) => v.uuid);
    }
  }
  return filter;
};
