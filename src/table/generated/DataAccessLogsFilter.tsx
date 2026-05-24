// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  AccessorTypeEnum,
  DataAccessLogsListData,
  User,
  usersList,
} from 'waldur-js-client';

import { DateField } from '@/form/DateField';
import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const DataAccessLogsFilter: FunctionComponent<{}> = () => (
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
            variant="tableFilter"
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
          <AsyncSelect
            placeholder={translate('User')}
            loadOptions={createLoadOptions(usersList, 'full_name', {
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
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const DataAccessLogsFilterFormId = 'DataAccessLogsFilter';

export interface DataAccessLogsFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: AccessorTypeOption;
  user: User;
}

type DataAccessLogsFilterQuery = DataAccessLogsListData['query'];

export const selectDataAccessLogsFilter = (
  values?: Partial<DataAccessLogsFilterFormData>,
): DataAccessLogsFilterQuery => {
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
};
