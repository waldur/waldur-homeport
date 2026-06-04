// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { CallStates, ProposalPublicCallsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter, BooleanFilter } from '@/table';

export const CallStatesOptions: CallStatesOption[] = [
  {
    label: translate('Active'),
    value: 'active',
  },
  {
    label: translate('Archived'),
    value: 'archived',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
];
export interface CallStatesOption {
  label: string;
  value: CallStates;
}

export const ProposalPublicCallsFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: CallStatesOption) => value?.label}
      placeholder={translate('State')}
      options={CallStatesOptions}
      getOptionValue={(option: CallStatesOption) => String(option.value)}
      getOptionLabel={(option: CallStatesOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <BooleanFilter
      title={translate('Active round')}
      name="has_active_round"
      badgeValue={(value) => (value ? translate('Yes') : translate('All'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const ProposalPublicCallsFilterFormId = 'ProposalPublicCallsFilter';

export interface ProposalPublicCallsFilterFormData {
  state: CallStatesOption[];
  has_active_round: boolean;
}

export const ProposalPublicCallsFilterInitialValues = {
  state: [{ label: translate('Active'), value: 'active' }],
  has_active_round: false,
};

type ProposalPublicCallsFilterQuery = ProposalPublicCallsListData['query'];

export const selectProposalPublicCallsFilter = (
  values?: Partial<ProposalPublicCallsFilterFormData>,
): ProposalPublicCallsFilterQuery => {
  const filter: ProposalPublicCallsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.has_active_round) {
      filter.has_active_round = values.has_active_round;
    }
  }
  return filter;
};
