// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { NotificationMessagesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const IsOverriddenChoices: IsOverriddenChoicesOption[] = [
  {
    label: translate('Not overridden'),
    value: false,
  },
  {
    label: translate('Overridden'),
    value: true,
  },
];
export interface IsOverriddenChoicesOption {
  label: string;
  value: boolean;
}

export const PureNotificationMessagesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="is_overridden"
    getValueLabel={(value: IsOverriddenChoicesOption) => value?.label}
  >
    <Field
      name="is_overridden"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={IsOverriddenChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: IsOverriddenChoicesOption) =>
            String(option.value)
          }
          getOptionLabel={(option: IsOverriddenChoicesOption) => option.label}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const NotificationMessagesFilterFormId = 'NotificationMessagesFilter';

interface NotificationMessagesFilterFormData {
  is_overridden: IsOverriddenChoicesOption;
}

export const NotificationMessagesFilter = reduxForm<
  NotificationMessagesFilterFormData,
  {}
>({
  form: NotificationMessagesFilterFormId,
  destroyOnUnmount: false,
})(PureNotificationMessagesFilter);

export const selectNotificationMessagesFilter = createSelector(
  getFormValues(NotificationMessagesFilterFormId),
  (values: NotificationMessagesFilterFormData | undefined) => {
    const filter: NotificationMessagesListData['query'] = {};
    if (values) {
      if (values.is_overridden) {
        filter.is_overridden = values.is_overridden.value;
      }
    }
    return filter;
  },
);
