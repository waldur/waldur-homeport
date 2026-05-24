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

import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
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

export const ProposalRequestedOfferingsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Organization')}
            loadOptions={createLoadOptions(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
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
          <AsyncSelect
            placeholder={translate('Call')}
            loadOptions={createLoadOptions(proposalPublicCallsList, 'name')}
            defaultOptions
            getOptionValue={(option: PublicCall) => String(option.url || '')}
            getOptionLabel={(option: PublicCall) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
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
            variant="tableFilter"
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
          <AsyncSelect
            placeholder={translate('Offering')}
            loadOptions={createLoadOptions(
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
            variant="tableFilter"
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
