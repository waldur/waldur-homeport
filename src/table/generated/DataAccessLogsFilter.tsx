// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  AccessorTypeEnum,
  DataAccessLogsListData,
  User,
  usersList,
} from 'waldur-js-client';

import { DateField } from '@waldur/form/DateField';
import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const AccessorTypeOptions: AccessorTypeOption[] = [
  {
    label: translate('Organization member'),
    value: 'organization_member',
  },
  {
    label: translate('Self'),
    value: 'self',
  },
  {
    label: translate('Service provider'),
    value: 'service_provider',
  },
  {
    label: translate('Staff'),
    value: 'staff',
  },
  {
    label: translate('Support'),
    value: 'support',
  },
];
export interface AccessorTypeOption {
  label: string;
  value: AccessorTypeEnum;
}

const PureDataAccessLogsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('Start date')} name="start_date">
      <Field
        name="start_date"
        component={DateField}
        placeholder={translate('Start date')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('End date')} name="end_date">
      <Field
        name="end_date"
        component={DateField}
        placeholder={translate('End date')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Accessor type')}
      name="accessor_type"
      getValueLabel={(value: AccessorTypeOption) => value?.label}
    >
      <Field
        name="accessor_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Accessor type')}
            options={AccessorTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AccessorTypeOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AccessorTypeOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
    >
      <Field
        name="user"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('User')}
            loadOptions={createSelectFetcher(usersList, 'full_name', {
              o: ['full_name'],
            })}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) =>
              String(option.full_name || option.username || option.email || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const DataAccessLogsFilterFormId = 'DataAccessLogsFilter';

interface DataAccessLogsFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: AccessorTypeOption;
  user: User;
}

export const DataAccessLogsFilter = reduxForm<DataAccessLogsFilterFormData, {}>(
  {
    form: DataAccessLogsFilterFormId,
    destroyOnUnmount: false,
  },
)(PureDataAccessLogsFilter);

type DataAccessLogsFilterQuery = DataAccessLogsListData['query'];

export const selectDataAccessLogsFilter = createSelector<
  RootState,
  Partial<DataAccessLogsFilterFormData>,
  DataAccessLogsFilterQuery
>(getFormValues(DataAccessLogsFilterFormId), (values) => {
  const filter: DataAccessLogsFilterQuery = {} as any;
  if (values) {
    if (values.start_date) {
      filter.start_date = values.start_date;
    }
    if (values.end_date) {
      filter.end_date = values.end_date;
    }
    if (values.accessor_type) {
      filter.accessor_type = values.accessor_type.value;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
  }
  return filter;
});
