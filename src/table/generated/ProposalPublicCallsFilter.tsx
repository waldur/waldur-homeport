// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { CallStates, ProposalPublicCallsListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CallStatesOptions: CallStatesOption[] = [
  {
    label: translate('Active'),
    value: 'active',
  },
  {
    label: translate('Archived'),
    value: 'archived',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
];
export interface CallStatesOption {
  label: string;
  value: CallStates;
}

const PureProposalPublicCallsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: CallStatesOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={CallStatesOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: CallStatesOption) => String(option.value)}
            getOptionLabel={(option: CallStatesOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Active round')}
      name="has_active_round"
      badgeValue={(value) => (value ? translate('Yes') : translate('All'))}
      ellipsis={false}
    >
      <Field
        name="has_active_round"
        component={AwesomeCheckboxField}
        label={translate('Active round')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
  </>
);

export const ProposalPublicCallsFilterFormId = 'ProposalPublicCallsFilter';

interface ProposalPublicCallsFilterFormData {
  state: CallStatesOption[];
  has_active_round: boolean;
}

export const ProposalPublicCallsFilter = reduxForm<
  ProposalPublicCallsFilterFormData,
  {}
>({
  form: ProposalPublicCallsFilterFormId,
  destroyOnUnmount: false,
  initialValues: {
    state: [{ label: translate('Active'), value: 'active' }],
    has_active_round: false,
  },
})(PureProposalPublicCallsFilter);

type ProposalPublicCallsFilterQuery = ProposalPublicCallsListData['query'];

export const selectProposalPublicCallsFilter = createSelector<
  RootState,
  Partial<ProposalPublicCallsFilterFormData>,
  ProposalPublicCallsFilterQuery
>(getFormValues(ProposalPublicCallsFilterFormId), (values) => {
  const filter: ProposalPublicCallsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.has_active_round) {
      filter.has_active_round = values.has_active_round;
    }
  }
  return filter;
});
