// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { SupportIssuesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

export const StatusOptions: StatusOption[] = [
  {
    label: translate('Closed'),
    value: 'Closed',
  },
  {
    label: translate('Open'),
    value: 'Open',
  },
  {
    label: translate('Resolved'),
    value: 'Resolved',
  },
  {
    label: translate('Waiting for support'),
    value: 'Waiting for support',
  },
];
export interface StatusOption {
  label: string;
  value: string;
}

const PureSupportIssuesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="status"
    getValueLabel={(value: StatusOption) => value?.label}
  >
    <Field
      name="status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={StatusOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: StatusOption) => String(option.value)}
          getOptionLabel={(option: StatusOption) => option.label}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const SupportIssuesFilterFormId = 'SupportIssuesFilter';

interface SupportIssuesFilterFormData {
  status: StatusOption;
}

export const SupportIssuesFilter = reduxForm<SupportIssuesFilterFormData, {}>({
  form: SupportIssuesFilterFormId,
  destroyOnUnmount: false,
})(PureSupportIssuesFilter);

type SupportIssuesFilterQuery = SupportIssuesListData['query'];

export const selectSupportIssuesFilter = createSelector<
  RootState,
  Partial<SupportIssuesFilterFormData>,
  SupportIssuesFilterQuery
>(getFormValues(SupportIssuesFilterFormId), (values) => {
  const filter: SupportIssuesFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.value;
    }
  }
  return filter;
});
