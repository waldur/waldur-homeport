// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
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

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

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

const PureProposalRequestedOfferingsFilter: FunctionComponent<{}> = () => (
  <>
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
            getOptionValue={(option: PublicCall) => String(option.url || '')}
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
      title={translate('Status')}
      name="state"
      getValueLabel={(value: RequestedOfferingStatesOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={RequestedOfferingStatesOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: RequestedOfferingStatesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: RequestedOfferingStatesOption) =>
              option.label
            }
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
    >
      <Field
        name="offering"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Offering')}
            loadOptions={createSelectFetcher(
              marketplacePublicOfferingsList,
              'query',
              { shared: true },
            )}
            defaultOptions
            getOptionValue={(option: PublicOfferingDetails) =>
              String(option.url || '')
            }
            getOptionLabel={(option: PublicOfferingDetails) =>
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
  </>
);

export const ProposalRequestedOfferingsFilterFormId =
  'ProposalRequestedOfferingsFilter';

export interface ProposalRequestedOfferingsFilterFormData {
  organization: Customer;
  call: PublicCall;
  state: RequestedOfferingStatesOption[];
  offering: PublicOfferingDetails;
}

export const ProposalRequestedOfferingsFilter =
  PureProposalRequestedOfferingsFilter;

type ProposalRequestedOfferingsFilterQuery =
  ProposalRequestedOfferingsListData['query'];

export const selectProposalRequestedOfferingsFilter = (
  values?: Partial<ProposalRequestedOfferingsFilterFormData>,
): ProposalRequestedOfferingsFilterQuery => {
  const filter: ProposalRequestedOfferingsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.organization_uuid = values.organization.uuid;
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
