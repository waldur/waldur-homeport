// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { MyTaskDueEnum, ProposalMyTasksListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const MyTaskDueOptions: MyTaskDueOption[] = [
  {
    label: translate('Due soon'),
    value: 'due_soon',
  },
  {
    label: translate('Overdue'),
    value: 'overdue',
  },
];
export interface MyTaskDueOption {
  label: string;
  value: MyTaskDueEnum;
}

export const ProposalMyTasksFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Due')}
    name="due"
    getValueLabel={(value: MyTaskDueOption) => value?.label}
    options={MyTaskDueOptions}
    getOptionValue={(option: MyTaskDueOption) => String(option.value)}
    getOptionLabel={(option: MyTaskDueOption) => option.label}
    isClearable={true}
    placeholder={translate('Any deadline')}
  />
);

export const ProposalMyTasksFilterFormId = 'ProposalMyTasksFilter';

export interface ProposalMyTasksFilterFormData {
  due: MyTaskDueOption;
}

type ProposalMyTasksFilterQuery = ProposalMyTasksListData['query'];

export const selectProposalMyTasksFilter = (
  values?: Partial<ProposalMyTasksFilterFormData>,
): ProposalMyTasksFilterQuery => {
  const filter: ProposalMyTasksFilterQuery = {} as any;
  if (values) {
    if (values.due) {
      filter.due = values.due.value;
    }
  }
  return filter;
};
