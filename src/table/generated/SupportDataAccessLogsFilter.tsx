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

export const AccessorTypeEnumChoices: AccessorTypeEnumChoicesOption[] = [
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
export interface AccessorTypeEnumChoicesOption {
  label: string;
  value: AccessorTypeEnum;
}

export const PureSupportDataAccessLogsFilter: FunctionComponent<{}> = () => (
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
      getValueLabel={(value: AccessorTypeEnumChoicesOption) => value?.label}
    >
      <Field
        name="accessor_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Accessor type')}
            options={AccessorTypeEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AccessorTypeEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AccessorTypeEnumChoicesOption) =>
              option.label
            }
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) => value?.full_name}
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
            getOptionLabel={(option: User) => String(option.full_name || '')}
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

export const SupportDataAccessLogsFilterFormId = 'SupportDataAccessLogsFilter';

interface SupportDataAccessLogsFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: AccessorTypeEnumChoicesOption;
  user: User;
}

export const SupportDataAccessLogsFilter = reduxForm<
  SupportDataAccessLogsFilterFormData,
  {}
>({
  form: SupportDataAccessLogsFilterFormId,
  destroyOnUnmount: false,
})(PureSupportDataAccessLogsFilter);

export const selectSupportDataAccessLogsFilter = createSelector<
  RootState,
  Partial<SupportDataAccessLogsFilterFormData>,
  DataAccessLogsListData['query']
>(getFormValues(SupportDataAccessLogsFilterFormId), (values) => {
  const filter: DataAccessLogsListData['query'] = {} as any;
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
