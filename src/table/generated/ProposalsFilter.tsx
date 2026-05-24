// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  ProposalProposalsListData,
  ProposalStates,
  PublicCall,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={ProposalStatesOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ProposalStatesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ProposalStatesOption) => option.label}
            isClearable={true}
            isMulti={true}
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
            getOptionValue={(option: PublicCall) => String(option.uuid || '')}
            getOptionLabel={(option: PublicCall) => String(option.name || '')}
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
