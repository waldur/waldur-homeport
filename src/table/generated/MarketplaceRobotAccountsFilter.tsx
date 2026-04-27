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

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureMarketplaceRobotAccountsFilter: FunctionComponent<
  MarketplaceRobotAccountsFilterProps
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

export const MarketplaceRobotAccountsFilterFormId =
  'MarketplaceRobotAccountsFilter';

interface MarketplaceRobotAccountsFilterProps {
  provider?: any;
}

interface MarketplaceRobotAccountsFilterFormData {
  customer: NameUuid;
  project: NameUuid;
}

export const MarketplaceRobotAccountsFilter = reduxForm<
  MarketplaceRobotAccountsFilterFormData,
  MarketplaceRobotAccountsFilterProps
>({
  form: MarketplaceRobotAccountsFilterFormId,
  destroyOnUnmount: false,
})(PureMarketplaceRobotAccountsFilter);

type MarketplaceRobotAccountsFilterQuery =
  MarketplaceRobotAccountsListData['query'];

export const selectMarketplaceRobotAccountsFilter = createSelector<
  RootState,
  Partial<MarketplaceRobotAccountsFilterFormData>,
  MarketplaceRobotAccountsFilterQuery
>(getFormValues(MarketplaceRobotAccountsFilterFormId), (values) => {
  const filter: MarketplaceRobotAccountsFilterQuery = {} as any;
  if (values) {
    if (values.customer) {
      filter.customer_uuid = values.customer.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
  }
  return filter;
});
