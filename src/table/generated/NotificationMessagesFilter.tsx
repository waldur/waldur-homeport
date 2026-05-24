// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { NotificationMessagesListData } from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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
  <TableFilterItem
    title={translate('Status')}
    name="is_overridden"
    getValueLabel={(value: IsOverriddenOption) => value?.label}
  >
    <Field
      name="is_overridden"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={IsOverriddenOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: IsOverriddenOption) => String(option.value)}
          getOptionLabel={(option: IsOverriddenOption) => option.label}
          isClearable={true}
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
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
