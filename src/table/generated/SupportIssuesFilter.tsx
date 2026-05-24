// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { SupportIssuesListData } from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
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

export const SupportIssuesFilter: FunctionComponent<{}> = () => (
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
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
);

export const SupportIssuesFilterFormId = 'SupportIssuesFilter';

export interface SupportIssuesFilterFormData {
  status: StatusOption;
}

type SupportIssuesFilterQuery = SupportIssuesListData['query'];

export const selectSupportIssuesFilter = (
  values?: Partial<SupportIssuesFilterFormData>,
): SupportIssuesFilterQuery => {
  const filter: SupportIssuesFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.value;
    }
  }
  return filter;
};
