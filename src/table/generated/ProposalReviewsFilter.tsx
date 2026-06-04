// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
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

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

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
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalReviewStateOption) => value?.label}
      placeholder={translate('State')}
      options={ProposalReviewStateOptions}
      getOptionValue={(option: ProposalReviewStateOption) =>
        String(option.value)
      }
      getOptionLabel={(option: ProposalReviewStateOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <AsyncSelectFilter
      title={translate('Call')}
      name="call"
      getValueLabel={(value: PublicCall) => value?.name}
      placeholder={translate('Call')}
      loadOptions={createLoadOptions(proposalPublicCallsList, 'name')}
      defaultOptions
      getOptionValue={(option: PublicCall) => String(option.uuid || '')}
      getOptionLabel={(option: PublicCall) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Round')}
      name="round"
      getValueLabel={(value: ProtectedRound) => value?.name}
      placeholder={translate('Round')}
      loadOptions={createLoadOptions(
        proposalProtectedCallsRoundsList,
        null as any,
        {},
        { uuid: props.callUuid },
      )}
      defaultOptions
      getOptionValue={(option: ProtectedRound) => String(option.uuid || '')}
      getOptionLabel={(option: ProtectedRound) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Reviewer')}
      name="reviewer"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      placeholder={translate('Reviewer')}
      loadOptions={createLoadOptions(usersList, 'query')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Proposal')}
      name="proposal"
      getValueLabel={(value: Proposal) => value?.name}
      placeholder={translate('Proposal')}
      loadOptions={createLoadOptions(proposalProposalsList, 'name', {
        call_uuid: props.callUuid,
      })}
      defaultOptions
      getOptionValue={(option: Proposal) => String(option.uuid || '')}
      getOptionLabel={(option: Proposal) => String(option.name || '')}
      isClearable={true}
    />
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
