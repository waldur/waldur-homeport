// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  MarketplaceResourcesListData,
  PublicOfferingDetails,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const ProjectResourcesFilter: FunctionComponent<
  ProjectResourcesFilterProps
> = (props) => (
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
            { project_uuid: props.project.uuid },
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
          isMulti={true}
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
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
