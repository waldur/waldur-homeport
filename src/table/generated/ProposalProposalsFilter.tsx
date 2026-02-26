// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  ProposalProposalsListData,
  ProposalStates,
  ProtectedRound,
  PublicCall,
  User,
  customersList,
  proposalProtectedCallsRoundsList,
  proposalPublicCallsList,
  usersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const ProposalStatesOptions: ProposalStatesOption[] = [
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
  {
    label: translate('In review'),
    value: 'in_review',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Submitted'),
    value: 'submitted',
  },
];
export interface ProposalStatesOption {
  label: string;
  value: ProposalStates;
}

const PureProposalProposalsFilter: FunctionComponent<
  ProposalProposalsFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={ProposalStatesOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ProposalStatesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ProposalStatesOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Call')}
      name="call"
      getValueLabel={(value: PublicCall) => value?.name}
    >
      <Field
        name="call"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Call')}
            loadOptions={createSelectFetcher(proposalPublicCallsList, 'name')}
            defaultOptions
            getOptionValue={(option: PublicCall) => String(option.uuid || '')}
            getOptionLabel={(option: PublicCall) => String(option.name || '')}
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
      title={translate('Round')}
      name="round"
      getValueLabel={(value: ProtectedRound) => value?.name}
    >
      <Field
        name="round"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Round')}
            loadOptions={createSelectFetcher(
              proposalProtectedCallsRoundsList,
              null as any,
              {},
              { uuid: props.callUuid },
            )}
            defaultOptions
            getOptionValue={(option: ProtectedRound) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: ProtectedRound) =>
              String(option.name || '')
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
      title={translate('Applicant')}
      name="applicant"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
    >
      <Field
        name="applicant"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Applicant')}
            loadOptions={createSelectFetcher(usersList, 'query')}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) =>
              String(option.full_name || option.username || option.email || '')
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
  </>
);

export const ProposalProposalsFilterFormId = 'ProposalProposalsFilter';

interface ProposalProposalsFilterProps {
  callUuid?: any;
}

interface ProposalProposalsFilterFormData {
  state: ProposalStatesOption[];
  call: PublicCall;
  round: ProtectedRound;
  organization: Customer;
  applicant: User;
}

export const ProposalProposalsFilter = reduxForm<
  ProposalProposalsFilterFormData,
  ProposalProposalsFilterProps
>({
  form: ProposalProposalsFilterFormId,
  destroyOnUnmount: false,
})(PureProposalProposalsFilter);

type ProposalProposalsFilterQuery = ProposalProposalsListData['query'];

export const selectProposalProposalsFilter = createSelector<
  RootState,
  Partial<ProposalProposalsFilterFormData>,
  ProposalProposalsFilterQuery
>(getFormValues(ProposalProposalsFilterFormId), (values) => {
  const filter: ProposalProposalsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.call) {
      filter.call_uuid = values.call.uuid;
    }
    if (values.round) {
      filter.round_uuid = values.round.uuid;
    }
    if (values.organization) {
      filter.organization_uuid = values.organization.uuid;
    }
    if (values.applicant) {
      filter.created_by_uuid = values.applicant.uuid;
    }
  }
  return filter;
});
