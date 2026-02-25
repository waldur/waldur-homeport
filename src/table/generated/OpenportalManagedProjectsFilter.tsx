// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  OpenportalManagedProjectsListData,
  RemoteProjectUpdateRequestStateEnum,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const RemoteProjectUpdateRequestStateEnumChoices: RemoteProjectUpdateRequestStateEnumChoicesOption[] =
  [
    {
      label: translate('Approved'),
      value: 'approved',
    },
    {
      label: translate('Canceled'),
      value: 'canceled',
    },
    {
      label: translate('Draft'),
      value: 'draft',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
  ];
export interface RemoteProjectUpdateRequestStateEnumChoicesOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

export const PureManagedProjectsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(
      value: RemoteProjectUpdateRequestStateEnumChoicesOption[],
    ) => value?.map((v) => v?.label).join(', ')}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={RemoteProjectUpdateRequestStateEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(
            option: RemoteProjectUpdateRequestStateEnumChoicesOption,
          ) => String(option.value)}
          getOptionLabel={(
            option: RemoteProjectUpdateRequestStateEnumChoicesOption,
          ) => option.label}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const ManagedProjectsFilterFormId = 'ManagedProjectsFilter';

interface ManagedProjectsFilterFormData {
  state: RemoteProjectUpdateRequestStateEnumChoicesOption[];
}

export const ManagedProjectsFilter = reduxForm<
  ManagedProjectsFilterFormData,
  {}
>({
  form: ManagedProjectsFilterFormId,
  destroyOnUnmount: false,
})(PureManagedProjectsFilter);

export const selectManagedProjectsFilter = createSelector<
  RootState,
  Partial<ManagedProjectsFilterFormData>,
  OpenportalManagedProjectsListData['query']
>(getFormValues(ManagedProjectsFilterFormId), (values) => {
  const filter: OpenportalManagedProjectsListData['query'] = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
});
