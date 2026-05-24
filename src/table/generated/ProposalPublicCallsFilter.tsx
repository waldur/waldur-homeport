// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { CallStates, ProposalPublicCallsListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const ProposalPublicCallsFilter: FunctionComponent<{}> = () => (
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
            variant="tableFilter"
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

export interface ProposalPublicCallsFilterFormData {
  state: CallStatesOption[];
  has_active_round: boolean;
}

export const ProposalPublicCallsFilterInitialValues = {
  state: [{ label: translate('Active'), value: 'active' }],
  has_active_round: false,
};

type ProposalPublicCallsFilterQuery = ProposalPublicCallsListData['query'];

export const selectProposalPublicCallsFilter = (
  values?: Partial<ProposalPublicCallsFilterFormData>,
): ProposalPublicCallsFilterQuery => {
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
};
