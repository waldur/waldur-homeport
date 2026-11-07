// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ProposalPublicCallsListData,
  PublicCallStateEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

export const PublicCallStateOptions: PublicCallStateOption[] = [
  {
    label: translate('Active'),
    value: 'active',
  },
  {
    label: translate('Archived'),
    value: 'archived',
  },
];
export interface PublicCallStateOption {
  label: string;
  value: PublicCallStateEnum;
}

export const ProposalPublicCallsFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: PublicCallStateOption) => value?.label}
      options={PublicCallStateOptions}
      getOptionValue={(option: PublicCallStateOption) => String(option.value)}
      getOptionLabel={(option: PublicCallStateOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('State')}
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
  state: PublicCallStateOption[];
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
