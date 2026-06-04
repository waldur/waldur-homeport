// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { NotificationMessagesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const IsOverriddenOptions: IsOverriddenOption[] = [
  {
    label: translate('Not overridden'),
    value: false,
  },
  {
    label: translate('Overridden'),
    value: true,
  },
];
export interface IsOverriddenOption {
  label: string;
  value: boolean;
}

export const NotificationMessagesFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Status')}
    name="is_overridden"
    getValueLabel={(value: IsOverriddenOption) => value?.label}
    placeholder={translate('Status')}
    options={IsOverriddenOptions}
    getOptionValue={(option: IsOverriddenOption) => String(option.value)}
    getOptionLabel={(option: IsOverriddenOption) => option.label}
    isClearable={true}
  />
);

export const NotificationMessagesFilterFormId = 'NotificationMessagesFilter';

export interface NotificationMessagesFilterFormData {
  is_overridden: IsOverriddenOption;
}

type NotificationMessagesFilterQuery = NotificationMessagesListData['query'];

export const selectNotificationMessagesFilter = (
  values?: Partial<NotificationMessagesFilterFormData>,
): NotificationMessagesFilterQuery => {
  const filter: NotificationMessagesFilterQuery = {} as any;
  if (values) {
    if (values.is_overridden) {
      filter.is_overridden = values.is_overridden.value;
    }
  }
  return filter;
};
