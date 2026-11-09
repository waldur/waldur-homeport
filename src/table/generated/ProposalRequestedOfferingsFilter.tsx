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
import { facetOption } from '@/table/facets';

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
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      facet="organization"
      facetOption={facetOption('uuid', 'name')}
      placeholder={translate('Organization')}
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
      facet="call"
      facetOption={facetOption('uuid', 'name')}
      placeholder={translate('Call')}
    />
    <SelectFilter
      title={translate('Status')}
      name="state"
      getValueLabel={(value: RequestedOfferingStatesOption) => value?.label}
      options={RequestedOfferingStatesOptions}
      getOptionValue={(option: RequestedOfferingStatesOption) =>
        String(option.value)
      }
      getOptionLabel={(option: RequestedOfferingStatesOption) => option.label}
      isClearable={true}
      isMulti={true}
      facet="state"
      placeholder={translate('Status')}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'query', {
        shared: true,
      })}
      defaultOptions
      getOptionValue={(option: PublicOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: PublicOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      facet="offering"
      facetOption={facetOption('uuid', 'name')}
      placeholder={translate('Offering')}
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
      filter.call_uuid = values.call.uuid;
    }
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
