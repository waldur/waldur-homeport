// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplaceRobotAccountsListData,
  NameUuid,
  marketplaceServiceProvidersRobotAccountCustomersList,
  marketplaceServiceProvidersRobotAccountProjectsList,
} from 'waldur-js-client';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureProviderRobotAccountFilter: FunctionComponent<
  ProviderRobotAccountFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="customer"
      getValueLabel={(value: NameUuid) => value?.name}
    >
      <Field
        name="customer"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(
              marketplaceServiceProvidersRobotAccountCustomersList,
              'customer_name',
              {},
              { uuid: props.provider.uuid },
            )}
            defaultOptions
            getOptionValue={(option: NameUuid) => String(option.uuid || '')}
            getOptionLabel={(option: NameUuid) => String(option.name || '')}
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
      getValueLabel={(value: NameUuid) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(
              marketplaceServiceProvidersRobotAccountProjectsList,
              'project_name',
              {},
              { uuid: props.provider.uuid },
            )}
            defaultOptions
            getOptionValue={(option: NameUuid) => String(option.uuid || '')}
            getOptionLabel={(option: NameUuid) => String(option.name || '')}
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

export const ProviderRobotAccountFilterFormId = 'ProviderRobotAccountFilter';

interface ProviderRobotAccountFilterProps {
  provider?: any;
}

interface ProviderRobotAccountFilterFormData {
  customer: NameUuid;
  project: NameUuid;
}

export const ProviderRobotAccountFilter = reduxForm<
  ProviderRobotAccountFilterFormData,
  ProviderRobotAccountFilterProps
>({
  form: ProviderRobotAccountFilterFormId,
  destroyOnUnmount: false,
})(PureProviderRobotAccountFilter);

export const selectProviderRobotAccountFilter = createSelector(
  getFormValues(ProviderRobotAccountFilterFormId),
  (values: ProviderRobotAccountFilterFormData | undefined) => {
    const filter: MarketplaceRobotAccountsListData['query'] = {};
    if (values) {
      if (values.customer) {
        filter.customer_uuid = values.customer.uuid;
      }
      if (values.project) {
        filter.project_uuid = values.project.uuid;
      }
    }
    return filter;
  },
);
