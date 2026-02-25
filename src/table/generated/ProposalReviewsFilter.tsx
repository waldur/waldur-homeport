// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  ProposalReviewStateEnum,
  ProposalReviewsListData,
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

export const ProposalReviewStateEnumChoices: ProposalReviewStateEnumChoicesOption[] =
  [
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
export interface ProposalReviewStateEnumChoicesOption {
  label: string;
  value: ProposalReviewStateEnum;
}

const PureProposalReviewsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: ProposalReviewStateEnumChoicesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={ProposalReviewStateEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ProposalReviewStateEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ProposalReviewStateEnumChoicesOption) =>
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
  </>
);

export const ProposalReviewsFilterFormId = 'ProposalReviewsFilter';

interface ProposalReviewsFilterFormData {
  state: ProposalReviewStateEnumChoicesOption[];
  call: PublicCall;
}

export const ProposalReviewsFilter = reduxForm<
  ProposalReviewsFilterFormData,
  {}
>({
  form: ProposalReviewsFilterFormId,
  destroyOnUnmount: false,
})(PureProposalReviewsFilter);

type ProposalReviewsFilterQuery = ProposalReviewsListData['query'];

export const selectProposalReviewsFilter = createSelector<
  RootState,
  Partial<ProposalReviewsFilterFormData>,
  ProposalReviewsFilterQuery
>(getFormValues(ProposalReviewsFilterFormId), (values) => {
  const filter: ProposalReviewsFilterQuery = {} as any;
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
