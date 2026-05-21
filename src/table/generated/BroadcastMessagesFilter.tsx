// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  BroadcastMessageStateEnum,
  BroadcastMessagesListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const BroadcastMessageStateOptions: BroadcastMessageStateOption[] = [
  {
    label: translate('Draft'),
    value: 'DRAFT',
  },
  {
    label: translate('Scheduled'),
    value: 'SCHEDULED',
  },
  {
    label: translate('Sent'),
    value: 'SENT',
  },
];
export interface BroadcastMessageStateOption {
  label: string;
  value: BroadcastMessageStateEnum;
}

export const BroadcastMessagesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: BroadcastMessageStateOption) => value?.label}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={BroadcastMessageStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: BroadcastMessageStateOption) =>
            String(option.value)
          }
          getOptionLabel={(option: BroadcastMessageStateOption) => option.label}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const BroadcastMessagesFilterFormId = 'BroadcastMessagesFilter';

export interface BroadcastMessagesFilterFormData {
  state: BroadcastMessageStateOption;
}

type BroadcastMessagesFilterQuery = BroadcastMessagesListData['query'];

export const selectBroadcastMessagesFilter = (
  values?: Partial<BroadcastMessagesFilterFormData>,
): BroadcastMessagesFilterQuery => {
  const filter: BroadcastMessagesFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.value;
    }
  }
  return filter;
};
