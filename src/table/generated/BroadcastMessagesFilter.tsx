// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  BroadcastMessageStateEnum,
  BroadcastMessagesListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const BroadcastMessageStateEnumChoices: BroadcastMessageStateEnumChoicesOption[] =
  [
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
export interface BroadcastMessageStateEnumChoicesOption {
  label: string;
  value: BroadcastMessageStateEnum;
}

export const PureBroadcastMessagesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: BroadcastMessageStateEnumChoicesOption) =>
      value?.label
    }
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={BroadcastMessageStateEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: BroadcastMessageStateEnumChoicesOption) =>
            String(option.value)
          }
          getOptionLabel={(option: BroadcastMessageStateEnumChoicesOption) =>
            option.label
          }
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const BroadcastMessagesFilterFormId = 'BroadcastMessagesFilter';

interface BroadcastMessagesFilterFormData {
  state: BroadcastMessageStateEnumChoicesOption;
}

export const BroadcastMessagesFilter = reduxForm<
  BroadcastMessagesFilterFormData,
  {}
>({
  form: BroadcastMessagesFilterFormId,
  destroyOnUnmount: false,
})(PureBroadcastMessagesFilter);

export const selectBroadcastMessagesFilter = createSelector<
  RootState,
  Partial<BroadcastMessagesFilterFormData>,
  BroadcastMessagesListData['query']
>(getFormValues(BroadcastMessagesFilterFormId), (values) => {
  const filter: BroadcastMessagesListData['query'] = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.value;
    }
  }
  return filter;
});
