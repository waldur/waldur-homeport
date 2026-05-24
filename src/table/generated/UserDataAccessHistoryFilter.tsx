// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { UsersDataAccessHistoryListData } from 'waldur-js-client';

import { DateField } from '@/form/DateField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const UserDataAccessHistoryAccessorTypeOptions: UserDataAccessHistoryAccessorTypeOption[] =
  [
    {
      value: 'organization_member',
      label: translate('Organization member'),
    },
    {
      value: 'self',
      label: translate('Self-access'),
    },
    {
      value: 'service_provider',
      label: translate('Service provider'),
    },
    {
      value: 'staff',
      label: translate('Staff'),
    },
    {
      value: 'support',
      label: translate('Support'),
    },
  ];
export interface UserDataAccessHistoryAccessorTypeOption {
  label: string;
  value: string;
}

export const UserDataAccessHistoryFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('Start date')} name="start_date">
      <Field
        name="start_date"
        component={DateField}
        placeholder={translate('Start date')}
        inline={true}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('End date')} name="end_date">
      <Field
        name="end_date"
        component={DateField}
        placeholder={translate('End date')}
        inline={true}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Accessor type')}
      name="accessor_type"
      getValueLabel={(value: UserDataAccessHistoryAccessorTypeOption) =>
        value?.label
      }
    >
      <Field
        name="accessor_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Accessor type')}
            options={UserDataAccessHistoryAccessorTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: UserDataAccessHistoryAccessorTypeOption) =>
              String(option.value)
            }
            getOptionLabel={(option: UserDataAccessHistoryAccessorTypeOption) =>
              option.label
            }
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const UserDataAccessHistoryFilterFormId = 'UserDataAccessHistoryFilter';

export interface UserDataAccessHistoryFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: UserDataAccessHistoryAccessorTypeOption;
}

type UserDataAccessHistoryFilterQuery = UsersDataAccessHistoryListData['query'];

export const selectUserDataAccessHistoryFilter = (
  values?: Partial<UserDataAccessHistoryFilterFormData>,
): UserDataAccessHistoryFilterQuery => {
  const filter: UserDataAccessHistoryFilterQuery = {} as any;
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
  }
  return filter;
};
