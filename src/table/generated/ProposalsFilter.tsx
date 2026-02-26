// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  ProposalProposalsListData,
  ProposalStates,
  PublicCall,
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

const PureProposalsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalStatesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
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
  </>
);

export const ProposalsFilterFormId = 'ProposalsFilter';

interface ProposalsFilterFormData {
  state: ProposalStatesOption[];
  call: PublicCall;
}

export const ProposalsFilter = reduxForm<ProposalsFilterFormData, {}>({
  form: ProposalsFilterFormId,
  destroyOnUnmount: false,
})(PureProposalsFilter);

type ProposalsFilterQuery = ProposalProposalsListData['query'];

export const selectProposalsFilter = createSelector<
  RootState,
  Partial<ProposalsFilterFormData>,
  ProposalsFilterQuery
>(getFormValues(ProposalsFilterFormId), (values) => {
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
});
