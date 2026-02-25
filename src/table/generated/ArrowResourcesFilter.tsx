// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  MarketplaceResourcesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureArrowResourcesFilter: FunctionComponent<
  ArrowResourcesFilterProps
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
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
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
              customer: props.organizationUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const ArrowResourcesFilterFormId = 'ArrowResourcesFilter';

interface ArrowResourcesFilterProps {
  organizationUuid?: any;
}

interface ArrowResourcesFilterFormData {
  organization: Customer;
  project: Project;
}

export const ArrowResourcesFilter = reduxForm<
  ArrowResourcesFilterFormData,
  ArrowResourcesFilterProps
>({
  form: ArrowResourcesFilterFormId,
  destroyOnUnmount: false,
})(PureArrowResourcesFilter);

export const selectArrowResourcesFilter = createSelector(
  getFormValues(ArrowResourcesFilterFormId),
  (values: ArrowResourcesFilterFormData | undefined) => {
    const filter: MarketplaceResourcesListData['query'] = {};
    if (values) {
      if (values.organization) {
        filter.customer_uuid = values.organization.uuid;
      }
      if (values.project) {
        filter.project_uuid = values.project.uuid;
      }
    }
    return filter;
  },
);
