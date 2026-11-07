// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ProposalOfferingDemandListData,
  ProviderOfferingDetails,
  PublicCall,
  StateGroupEnum,
  marketplaceProviderOfferingsList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const StateGroupOptions: StateGroupOption[] = [
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
  {
    label: translate('Closed'),
    value: 'closed',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
];
export interface StateGroupOption {
  label: string;
  value: StateGroupEnum;
}

export const ProposalOfferingDemandFilter: FunctionComponent<
  ProposalOfferingDemandFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(
        marketplaceProviderOfferingsList,
        'query',
        { customer_uuid: props.providerUuid },
      )}
      defaultOptions
      getOptionValue={(option: ProviderOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: ProviderOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      placeholder={translate('Offering')}
    />
    <AsyncSelectFilter
      title={translate('Call')}
      name="call"
      getValueLabel={(value: PublicCall) => value?.name}
      loadOptions={createLoadOptions(proposalPublicCallsList, 'name', {
        offerings_provider_uuid: props.providerUuid,
      })}
      defaultOptions
      getOptionValue={(option: PublicCall) => String(option.uuid || '')}
      getOptionLabel={(option: PublicCall) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Call')}
    />
    <SelectFilter
      title={translate('Round')}
      name="round"
      getValueLabel={(value: any) => value?.label}
      options={props.roundOptions}
      isClearable={true}
      placeholder={translate('Round')}
    />
    <SelectFilter
      title={translate('Proposals')}
      name="state_group"
      getValueLabel={(value: StateGroupOption) => value?.label}
      options={StateGroupOptions}
      getOptionValue={(option: StateGroupOption) => String(option.value)}
      getOptionLabel={(option: StateGroupOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('Proposals')}
    />
  </>
);

export const ProposalOfferingDemandFilterFormId =
  'ProposalOfferingDemandFilter';

interface ProposalOfferingDemandFilterProps {
  providerUuid?: any;
  roundOptions?: any[];
}

export interface ProposalOfferingDemandFilterFormData {
  offering: ProviderOfferingDetails;
  call: PublicCall;
  round: any;
  state_group: StateGroupOption[];
}

type ProposalOfferingDemandFilterQuery =
  ProposalOfferingDemandListData['query'];

export const selectProposalOfferingDemandFilter = (
  values?: Partial<ProposalOfferingDemandFilterFormData>,
): ProposalOfferingDemandFilterQuery => {
  const filter: ProposalOfferingDemandFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
    if (values.call) {
      filter.call_uuid = values.call.uuid;
    }
    if (values.round) {
      filter.round_uuid = values.round.value;
    }
    if (values.state_group) {
      filter.state_group = values.state_group.map((v: any) => v.value);
    }
  }
  return filter;
};
