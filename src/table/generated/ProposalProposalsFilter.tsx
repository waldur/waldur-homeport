// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CallRound,
  Customer,
  ProposalProposalsListData,
  ProposalStates,
  PublicCall,
  callRoundsList,
  customersList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const ProposalStatesChoices: ProposalStatesChoicesOption[] = [
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
export interface ProposalStatesChoicesOption {
  label: string;
  value: ProposalStates;
}

const PureProposalProposalsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesChoicesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={ProposalStatesChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ProposalStatesChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ProposalStatesChoicesOption) =>
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
            getOptionValue={(option: PublicCall) => String(option.uuid || '')}
            getOptionLabel={(option: PublicCall) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Round')}
      name="round"
      getValueLabel={(value: CallRound) => value?.slug}
    >
      <Field
        name="round"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Round')}
            loadOptions={createSelectFetcher(callRoundsList, null as any)}
            defaultOptions
            getOptionValue={(option: CallRound) => String(option.uuid || '')}
            getOptionLabel={(option: CallRound) => String(option.slug || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
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
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const ProposalProposalsFilterFormId = 'ProposalProposalsFilter';

interface ProposalProposalsFilterFormData {
  state: ProposalStatesChoicesOption[];
  call: PublicCall;
  round: CallRound;
  organization: Customer;
}

export const ProposalProposalsFilter = reduxForm<
  ProposalProposalsFilterFormData,
  {}
>({
  form: ProposalProposalsFilterFormId,
  destroyOnUnmount: false,
  initialValues: {
    state: [
      { label: translate('Submitted'), value: 'submitted' },
      { label: translate('Accepted'), value: 'accepted' },
      { label: translate('In review'), value: 'in_review' },
    ],
  },
})(PureProposalProposalsFilter);

type ProposalProposalsFilterQuery = ProposalProposalsListData['query'];

export const selectProposalProposalsFilter = createSelector<
  RootState,
  Partial<ProposalProposalsFilterFormData>,
  ProposalProposalsFilterQuery
>(getFormValues(ProposalProposalsFilterFormId), (values) => {
  const filter: ProposalProposalsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.call) {
      filter.call_uuid = values.call.uuid;
    }
    if (values.round) {
      filter.round_uuid = values.round.uuid;
    }
    if (values.organization) {
      filter.organization_uuid = values.organization.uuid;
    }
  }
  return filter;
});
