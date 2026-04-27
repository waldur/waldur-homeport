// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  OpenportalManagedProjectsListData,
  RemoteProjectUpdateRequestStateEnum,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

export const RemoteProjectUpdateRequestStateOptions: RemoteProjectUpdateRequestStateOption[] =
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
export interface RemoteProjectUpdateRequestStateOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

const PureOpenportalManagedProjectsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: RemoteProjectUpdateRequestStateOption) =>
      value?.label
    }
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={RemoteProjectUpdateRequestStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: RemoteProjectUpdateRequestStateOption) =>
            String(option.value)
          }
          getOptionLabel={(option: RemoteProjectUpdateRequestStateOption) =>
            option.label
          }
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const OpenportalManagedProjectsFilterFormId =
  'OpenportalManagedProjectsFilter';

interface OpenportalManagedProjectsFilterFormData {
  state: RemoteProjectUpdateRequestStateOption[];
}

export const OpenportalManagedProjectsFilter = reduxForm<
  OpenportalManagedProjectsFilterFormData,
  {}
>({
  form: OpenportalManagedProjectsFilterFormId,
  destroyOnUnmount: false,
})(PureOpenportalManagedProjectsFilter);

type OpenportalManagedProjectsFilterQuery =
  OpenportalManagedProjectsListData['query'];

export const selectOpenportalManagedProjectsFilter = createSelector<
  RootState,
  Partial<OpenportalManagedProjectsFilterFormData>,
  OpenportalManagedProjectsFilterQuery
>(getFormValues(OpenportalManagedProjectsFilterFormId), (values) => {
  const filter: OpenportalManagedProjectsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
});
