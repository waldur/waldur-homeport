// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  Customer,
  Proposal,
  ProposalReviewStateEnum,
  ProposalReviewsListData,
  ProtectedRound,
  PublicCall,
  User,
  customersList,
  proposalProposalsList,
  proposalProtectedCallsRoundsList,
  proposalPublicCallsList,
  usersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

export const ProposalReviewStateOptions: ProposalReviewStateOption[] = [
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
export interface ProposalReviewStateOption {
  label: string;
  value: ProposalReviewStateEnum;
}

export const ProposalReviewsFilter: FunctionComponent<
  ProposalReviewsFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalReviewStateOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={ProposalReviewStateOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ProposalReviewStateOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ProposalReviewStateOption) => option.label}
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
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Reviewer')}
      name="reviewer"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
    >
      <Field
        name="reviewer"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Reviewer')}
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
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Proposal')}
      name="proposal"
      getValueLabel={(value: Proposal) => value?.name}
    >
      <Field
        name="proposal"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Proposal')}
            loadOptions={createSelectFetcher(proposalProposalsList, 'name', {
              call_uuid: props.callUuid,
            })}
            defaultOptions
            getOptionValue={(option: Proposal) => String(option.uuid || '')}
            getOptionLabel={(option: Proposal) => String(option.name || '')}
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

export const ProposalReviewsFilterFormId = 'ProposalReviewsFilter';

interface ProposalReviewsFilterProps {
  callUuid?: any;
}

export interface ProposalReviewsFilterFormData {
  state: ProposalReviewStateOption[];
  call: PublicCall;
  round: ProtectedRound;
  organization: Customer;
  reviewer: User;
  proposal: Proposal;
}

type ProposalReviewsFilterQuery = ProposalReviewsListData['query'];

export const selectProposalReviewsFilter = (
  values?: Partial<ProposalReviewsFilterFormData>,
): ProposalReviewsFilterQuery => {
  const filter: ProposalReviewsFilterQuery = {} as any;
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
    if (values.reviewer) {
      filter.reviewer_uuid = values.reviewer.uuid;
    }
    if (values.proposal) {
      filter.proposal_uuid = values.proposal.uuid;
    }
  }
  return filter;
};
