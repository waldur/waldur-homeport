// This file is auto-generated. Do not edit manually.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CustomersListData,
  OrganizationGroup,
  organizationGroupsList,
} from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const AccountingIsRunningEnum = [
  {
    label: translate('Not running accounting'),
    value: false,
  },
  {
    label: translate('Running accounting'),
    value: true,
  },
  {
    label: translate('All'),
    value: 'undefined',
  },
];
interface AccountingIsRunningEnumOption {
  label: string;
  value: any;
}

const BooleanEnum = [
  {
    label: translate('No'),
    value: false,
  },
  {
    label: translate('Yes'),
    value: true,
  },
  {
    label: translate('All'),
  },
];
interface BooleanEnumOption {
  label: string;
  value: any;
}

export const PureCustomersFilter: FunctionComponent<any> = (_props) => (
  <>
    <TableFilterItem
      title={translate('Accounting is running')}
      name="accounting_is_running"
      getValueLabel={(value) => value?.label}
    >
      <Field
        name="accounting_is_running"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Show with running accounting')}
            options={AccountingIsRunningEnum}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="is_service_provider"
      getValueLabel={(value) => value?.label}
    >
      <Field
        name="is_service_provider"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Service provider')}
            options={BooleanEnum}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    {isFeatureVisible(
      MarketplaceFeatures.show_call_management_functionality,
    ) && (
      <TableFilterItem
        title={translate('Call managing organization')}
        name="is_call_managing_organization"
        getValueLabel={(value) => value?.label}
      >
        <Field
          name="is_call_managing_organization"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Call managing organization')}
              options={BooleanEnum}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    )}
    <TableFilterItem
      title={translate('Organization group')}
      name="organization_group"
      getValueLabel={(value: OrganizationGroup) => value?.name}
    >
      <Field
        name="organization_group"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization group')}
            loadOptions={createSelectFetcher(organizationGroupsList, 'name')}
            defaultOptions
            getOptionValue={(option: OrganizationGroup) => option.uuid}
            getOptionLabel={(option: OrganizationGroup) => option.name}
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
  </>
);

export const CustomersFilterFormId = 'CustomersFilter';

interface CustomersFilterFormData {
  accounting_is_running: AccountingIsRunningEnumOption;
  is_service_provider: BooleanEnumOption;
  is_call_managing_organization: BooleanEnumOption;
  organization_group: OrganizationGroup[];
}

export const CustomersFilter = reduxForm<CustomersFilterFormData, any>({
  form: CustomersFilterFormId,
  destroyOnUnmount: false,
})(PureCustomersFilter);

export const selectCustomersFilter = createSelector(
  getFormValues(CustomersFilterFormId),
  (values: CustomersFilterFormData | undefined) => {
    const filter: CustomersListData['query'] = {};
    if (values) {
      if (values.accounting_is_running) {
        filter.accounting_is_running = values.accounting_is_running.value;
      }
      if (values.is_service_provider) {
        filter.is_service_provider = values.is_service_provider.value;
      }
      if (values.is_call_managing_organization) {
        filter.is_call_managing_organization =
          values.is_call_managing_organization.value;
      }
      if (values.organization_group) {
        filter.organization_group_uuid = values.organization_group.map(
          (v) => v.uuid,
        ) as any;
      }
    }
    return filter;
  },
);
