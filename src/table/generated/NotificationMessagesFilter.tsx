// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { NotificationMessagesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
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

const PureNotificationMessagesFilter: FunctionComponent<{}> = () => (
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
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const NotificationMessagesFilterFormId = 'NotificationMessagesFilter';

interface NotificationMessagesFilterFormData {
  is_overridden: IsOverriddenOption;
}

export const NotificationMessagesFilter = reduxForm<
  NotificationMessagesFilterFormData,
  {}
>({
  form: NotificationMessagesFilterFormId,
  destroyOnUnmount: false,
})(PureNotificationMessagesFilter);

type NotificationMessagesFilterQuery = NotificationMessagesListData['query'];

export const selectNotificationMessagesFilter = createSelector<
  RootState,
  Partial<NotificationMessagesFilterFormData>,
  NotificationMessagesFilterQuery
>(getFormValues(NotificationMessagesFilterFormId), (values) => {
  const filter: NotificationMessagesFilterQuery = {} as any;
  if (values) {
    if (values.is_overridden) {
      filter.is_overridden = values.is_overridden.value;
    }
  }
  return filter;
});
