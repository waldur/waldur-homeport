// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ProposalProposalsListData,
  ProposalStates,
  PublicCall,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

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

export const ProposalsFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesOption) => value?.label}
      placeholder={translate('State')}
      options={ProposalStatesOptions}
      getOptionValue={(option: ProposalStatesOption) => String(option.value)}
      getOptionLabel={(option: ProposalStatesOption) => option.label}
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
  </>
);

export const ProposalsFilterFormId = 'ProposalsFilter';

export interface ProposalsFilterFormData {
  state: ProposalStatesOption[];
  call: PublicCall;
}

type ProposalsFilterQuery = ProposalProposalsListData['query'];

export const selectProposalsFilter = (
  values?: Partial<ProposalsFilterFormData>,
): ProposalsFilterQuery => {
  const filter: ProposalsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.call) {
      filter.call_uuid = values.call.uuid;
    }
  }
  return filter;
};
