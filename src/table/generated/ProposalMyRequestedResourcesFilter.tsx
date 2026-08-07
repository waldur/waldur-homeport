// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ProposalMyRequestedResourcesListData,
  ProposalStates,
  PublicOfferingDetails,
  marketplacePublicOfferingsList,
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

export const ProposalMyRequestedResourcesFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Proposal state')}
      name="proposal_state"
      getValueLabel={(value: ProposalStatesOption) => value?.label}
      options={ProposalStatesOptions}
      getOptionValue={(option: ProposalStatesOption) => String(option.value)}
      getOptionLabel={(option: ProposalStatesOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('Proposal state')}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query')}
      defaultOptions
      getOptionValue={(option: PublicOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: PublicOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      placeholder={translate('Offering')}
    />
  </>
);

export const ProposalMyRequestedResourcesFilterFormId =
  'ProposalMyRequestedResourcesFilter';

export interface ProposalMyRequestedResourcesFilterFormData {
  proposal_state: ProposalStatesOption[];
  offering: PublicOfferingDetails;
}

type ProposalMyRequestedResourcesFilterQuery =
  ProposalMyRequestedResourcesListData['query'];

export const selectProposalMyRequestedResourcesFilter = (
  values?: Partial<ProposalMyRequestedResourcesFilterFormData>,
): ProposalMyRequestedResourcesFilterQuery => {
  const filter: ProposalMyRequestedResourcesFilterQuery = {} as any;
  if (values) {
    if (values.proposal_state) {
      filter.proposal_state = values.proposal_state.map((v: any) => v.value);
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
