// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  InvitationState,
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

export const InvitationStateChoices: InvitationStateChoicesOption[] = [
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
export interface InvitationStateChoicesOption {
  label: string;
  value: InvitationState;
}

export const ScopeTypeChoices: ScopeTypeChoicesOption[] = [
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
export interface ScopeTypeChoicesOption {
  label: string;
  value: string;
}

export const PureUserInvitationsFilter: FunctionComponent<
  UserInvitationsFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: InvitationStateChoicesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={InvitationStateChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: InvitationStateChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: InvitationStateChoicesOption) =>
              option.label
            }
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
            getOptionValue={
              props.getOptionValue ||
              ((option: RoleDetails) => String(option.uuid || ''))
            }
            getOptionLabel={
              props.getOptionLabel ||
              ((option: RoleDetails) => String(option.description || ''))
            }
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
            getOptionValue={
              props.getOptionValue ||
              ((option: Customer) => String(option.uuid || ''))
            }
            getOptionLabel={
              props.getOptionLabel ||
              ((option: Customer) => String(option.name || ''))
            }
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
      getValueLabel={(value: ScopeTypeChoicesOption) => value?.label}
    >
      <Field
        name="scope_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Scope type')}
            options={ScopeTypeChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ScopeTypeChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ScopeTypeChoicesOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const UserInvitationsFilterFormId = 'UserInvitationsFilter';

interface UserInvitationsFilterProps {
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
}

interface UserInvitationsFilterFormData {
  state: InvitationStateChoicesOption[];
  role: RoleDetails;
  customer: Customer;
  scope_type: ScopeTypeChoicesOption;
}

export const UserInvitationsFilter = reduxForm<
  UserInvitationsFilterFormData,
  UserInvitationsFilterProps
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
        filter.state = values.state.map((v: any) => v.value);
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
