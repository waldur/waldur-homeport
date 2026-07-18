// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  ProposalRequestedOfferingsListData,
  PublicCall,
  PublicOfferingDetails,
  RequestedOfferingStates,
  customersList,
  marketplacePublicOfferingsList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const RequestedOfferingStatesOptions: RequestedOfferingStatesOption[] = [
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Requested'),
    value: 'requested',
  },
];
export interface RequestedOfferingStatesOption {
  label: string;
  value: RequestedOfferingStates;
}

export const ProposalRequestedOfferingsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="organization_uuid"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Call')}
      name="call"
      getValueLabel={(value: PublicCall) => value?.name}
      placeholder={translate('Call')}
      loadOptions={createLoadOptions(proposalPublicCallsList, 'name')}
      defaultOptions
      getOptionValue={(option: PublicCall) => String(option.url || '')}
      getOptionLabel={(option: PublicCall) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Status')}
      name="state"
      getValueLabel={(value: RequestedOfferingStatesOption) => value?.label}
      placeholder={translate('Status')}
      options={RequestedOfferingStatesOptions}
      getOptionValue={(option: RequestedOfferingStatesOption) =>
        String(option.value)
      }
      getOptionLabel={(option: RequestedOfferingStatesOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
      placeholder={translate('Offering')}
      loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query', {
        shared: true,
      })}
      defaultOptions
      getOptionValue={(option: PublicOfferingDetails) =>
        String(option.url || '')
      }
      getOptionLabel={(option: PublicOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
    />
  </>
);

export const ProposalRequestedOfferingsFilterFormId =
  'ProposalRequestedOfferingsFilter';

export interface ProposalRequestedOfferingsFilterFormData {
  organization_uuid: Customer;
  call: PublicCall;
  state: RequestedOfferingStatesOption[];
  offering: PublicOfferingDetails;
}

type ProposalRequestedOfferingsFilterQuery =
  ProposalRequestedOfferingsListData['query'];

export const selectProposalRequestedOfferingsFilter = (
  values?: Partial<ProposalRequestedOfferingsFilterFormData>,
): ProposalRequestedOfferingsFilterQuery => {
  const filter: ProposalRequestedOfferingsFilterQuery = {} as any;
  if (values) {
    if (values.organization_uuid) {
      filter.organization_uuid = values.organization_uuid.uuid;
    }
    if (values.call) {
      filter.call = values.call.url;
    }
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.offering) {
      filter.offering = values.offering.url;
    }
  }
  return filter;
};
