// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { SupportIssuesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const StatusChoices: StatusChoicesOption[] = [
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
export interface StatusChoicesOption {
  label: string;
  value: string;
}

const PureSupportIssuesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="status"
    getValueLabel={(value: StatusChoicesOption) => value?.label}
  >
    <Field
      name="status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={StatusChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: StatusChoicesOption) => String(option.value)}
          getOptionLabel={(option: StatusChoicesOption) => option.label}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const SupportIssuesFilterFormId = 'SupportIssuesFilter';

interface SupportIssuesFilterFormData {
  status: StatusChoicesOption;
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
