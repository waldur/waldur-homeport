// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  CallPanel,
  Customer,
  PostAwardStatusEnum,
  ProposalProposalsListData,
  ProposalStates,
  ProtectedRound,
  PublicCall,
  User,
  customersList,
  proposalProtectedCallsPanelsList,
  proposalProtectedCallsRoundsList,
  proposalPublicCallsList,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter, SelectFilter } from '@/table';

export const PostAwardStatusOptions: PostAwardStatusOption[] = [
  {
    label: translate('Pending extension request assessment'),
    value: 'extension_in_assessment',
  },
  {
    label: translate('Pending extension request results'),
    value: 'extension_pending_results',
  },
  {
    label: translate('Extension request open'),
    value: 'extension_requested',
  },
  {
    label: translate('Final report submitted'),
    value: 'final_report_submitted',
  },
  {
    label: translate('Pending final report'),
    value: 'pending_final_report',
  },
  {
    label: translate('Project completed'),
    value: 'project_completed',
  },
  {
    label: translate('Project extended'),
    value: 'project_extended',
  },
];
export interface PostAwardStatusOption {
  label: string;
  value: PostAwardStatusEnum;
}

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

export const ProposalProposalsFilter: FunctionComponent<
  ProposalProposalsFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesOption) => value?.label}
      options={ProposalStatesOptions}
      getOptionValue={(option: ProposalStatesOption) => String(option.value)}
      getOptionLabel={(option: ProposalStatesOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('State')}
    />
    <AsyncSelectFilter
      title={translate('Call')}
      name="call"
      getValueLabel={(value: PublicCall) => value?.name}
      loadOptions={createLoadOptions(proposalPublicCallsList, 'name')}
      defaultOptions
      getOptionValue={(option: PublicCall) => String(option.uuid || '')}
      getOptionLabel={(option: PublicCall) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Call')}
    />
    <AsyncSelectFilter
      title={translate('Round')}
      name="round"
      getValueLabel={(value: ProtectedRound) => value?.name}
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
      placeholder={translate('Round')}
    />
    <AsyncSelectFilter
      title={translate('Organization running the call')}
      name="organization_uuid"
      getValueLabel={(value: Customer) => value?.name}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Organization running the call')}
    />
    <AsyncSelectFilter
      title={translate('Applicant')}
      name="applicant"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'query')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('Applicant')}
    />
    <AsyncSelectFilter
      title={translate('Panel')}
      name="panel"
      getValueLabel={(value: CallPanel) => value?.name}
      loadOptions={createLoadOptions(
        proposalProtectedCallsPanelsList,
        null as any,
        {},
        { uuid: props.callUuid },
      )}
      defaultOptions
      getOptionValue={(option: CallPanel) => String(option.uuid || '')}
      getOptionLabel={(option: CallPanel) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Panel')}
    />
    <SelectFilter
      title={translate('Extension or final report')}
      name="post_award_status"
      getValueLabel={(value: PostAwardStatusOption) => value?.label}
      options={PostAwardStatusOptions}
      getOptionValue={(option: PostAwardStatusOption) => String(option.value)}
      getOptionLabel={(option: PostAwardStatusOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('Extension or final report')}
    />
    <BooleanFilter
      title={translate('Final report overdue')}
      name="final_report_overdue"
      badgeValue={(value) =>
        value ? translate('Final report overdue') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const ProposalProposalsFilterFormId = 'ProposalProposalsFilter';

interface ProposalProposalsFilterProps {
  callUuid?: any;
}

export interface ProposalProposalsFilterFormData {
  state: ProposalStatesOption[];
  call: PublicCall;
  round: ProtectedRound;
  organization_uuid: Customer;
  applicant: User;
  panel: CallPanel;
  post_award_status: PostAwardStatusOption[];
  final_report_overdue: boolean;
}

type ProposalProposalsFilterQuery = ProposalProposalsListData['query'];

export const selectProposalProposalsFilter = (
  values?: Partial<ProposalProposalsFilterFormData>,
): ProposalProposalsFilterQuery => {
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
    if (values.organization_uuid) {
      filter.organization_uuid = values.organization_uuid.uuid;
    }
    if (values.applicant) {
      filter.created_by_uuid = values.applicant.uuid;
    }
    if (values.panel) {
      filter.panel_uuid = values.panel.uuid;
    }
    if (values.post_award_status) {
      filter.post_award_status = values.post_award_status.map(
        (v: any) => v.value,
      );
    }
    if (values.final_report_overdue) {
      filter.final_report_overdue = values.final_report_overdue;
    }
  }
  return filter;
};
