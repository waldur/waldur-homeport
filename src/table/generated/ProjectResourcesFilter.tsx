// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplaceResourcesListData,
  PublicOfferingDetails,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureProjectResourcesFilter: FunctionComponent<
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
        <AsyncPaginate
          placeholder={translate('Offering')}
          loadOptions={createSelectFetcher(
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
          {...REACT_SELECT_TABLE_FILTER}
          className="metronic-select-container"
        />
      )}
    />
  </TableFilterItem>
);

export const ProjectResourcesFilterFormId = 'ProjectResourcesFilter';

interface ProjectResourcesFilterProps {
  project?: any;
}

interface ProjectResourcesFilterFormData {
  offering: PublicOfferingDetails[];
}

export const ProjectResourcesFilter = reduxForm<
  ProjectResourcesFilterFormData,
  ProjectResourcesFilterProps
>({
  form: ProjectResourcesFilterFormId,
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);

type ProjectResourcesFilterQuery = MarketplaceResourcesListData['query'];

export const selectProjectResourcesFilter = createSelector<
  RootState,
  Partial<ProjectResourcesFilterFormData>,
  ProjectResourcesFilterQuery
>(getFormValues(ProjectResourcesFilterFormId), (values) => {
  const filter: ProjectResourcesFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.map((v: any) => v.uuid);
    }
  }
  return filter;
});
