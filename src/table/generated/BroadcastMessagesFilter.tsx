// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  BroadcastMessageStateEnum,
  BroadcastMessagesListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

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
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(value: BroadcastMessageStateOption) => value?.label}
    placeholder={translate('State')}
    options={BroadcastMessageStateOptions}
    getOptionValue={(option: BroadcastMessageStateOption) =>
      String(option.value)
    }
    getOptionLabel={(option: BroadcastMessageStateOption) => option.label}
    isClearable={true}
  />
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
