// This file is auto-generated. Do not edit manually.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  RoleDetails,
  UserInvitationsListData,
  customersList,
  rolesList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const ScopeTypeEnum = [
  {
    label: translate('Call'),
    value: 'call',
  },
  {
    label: translate('Call managing organization'),
    value: 'call_organizer',
  },
  {
    label: translate('Organization'),
    value: 'customer',
  },
  {
    label: translate('Offering'),
    value: 'offering',
  },
  {
    label: translate('Project'),
    value: 'project',
  },
  {
    label: translate('Proposal'),
    value: 'proposal',
  },
  {
    label: translate('Service provider organization'),
    value: 'service_provider',
  },
];
interface ScopeTypeEnumOption {
  label: string;
  value: string;
}

const StateEnum = [
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Pending project start'),
    value: 'project',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Requested'),
    value: 'requested',
  },
];
interface StateEnumOption {
  label: string;
  value: string;
}

export const PureUserInvitationsFilter: FunctionComponent<any> = (_props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={StateEnum}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Role')}
      name="role"
      getValueLabel={(value: RoleDetails) => value?.description}
    >
      <Field
        name="role"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Role')}
            loadOptions={createSelectFetcher(rolesList, 'name')}
            defaultOptions
            getOptionValue={(option: RoleDetails) => option.uuid}
            getOptionLabel={(option: RoleDetails) => option.description}
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
      title={translate('Organization')}
      name="customer"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="customer"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => option.uuid}
            getOptionLabel={(option: Customer) => option.name}
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
      title={translate('Scope type')}
      name="scope_type"
      getValueLabel={(value) => value?.label}
    >
      <Field
        name="scope_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Scope type')}
            options={ScopeTypeEnum}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const UserInvitationsFilterFormId = 'UserInvitationsFilter';

interface UserInvitationsFilterFormData {
  state: StateEnumOption[];
  role: RoleDetails;
  customer: Customer;
  scope_type: ScopeTypeEnumOption;
}

export const UserInvitationsFilter = reduxForm<
  UserInvitationsFilterFormData,
  any
>({
  form: UserInvitationsFilterFormId,
  destroyOnUnmount: false,
})(PureUserInvitationsFilter);

export const selectUserInvitationsFilter = createSelector(
  getFormValues(UserInvitationsFilterFormId),
  (values: UserInvitationsFilterFormData | undefined) => {
    const filter: UserInvitationsListData['query'] = {};
    if (values) {
      if (values.state) {
        filter.state = values.state.map((v) => v.value) as any;
      }
      if (values.role) {
        filter.role_uuid = values.role.uuid;
      }
      if (values.customer) {
        filter.customer_uuid = values.customer.uuid;
      }
      if (values.scope_type) {
        filter.scope_type = values.scope_type.value;
      }
    }
    return filter;
  },
);
