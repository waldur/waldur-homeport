// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  AdminAnnouncementTypeEnum,
  AdminAnnouncementsListData,
} from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const AdminAnnouncementTypeOptions: AdminAnnouncementTypeOption[] = [
  {
    label: translate('Danger'),
    value: 'danger',
  },
  {
    label: translate('Information'),
    value: 'information',
  },
  {
    label: translate('Warning'),
    value: 'warning',
  },
];
export interface AdminAnnouncementTypeOption {
  label: string;
  value: AdminAnnouncementTypeEnum;
}

export const IsActiveOptions: IsActiveOption[] = [
  {
    label: translate('Inactive'),
    value: false,
  },
  {
    label: translate('Active'),
    value: true,
  },
];
export interface IsActiveOption {
  label: string;
  value: boolean;
}

export const AdminAnnouncementsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Type')}
      name="type"
      getValueLabel={(value: AdminAnnouncementTypeOption) => value?.label}
    >
      <Field
        name="type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Type')}
            options={AdminAnnouncementTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AdminAnnouncementTypeOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AdminAnnouncementTypeOption) =>
              option.label
            }
            isClearable={true}
            isMulti={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Status')}
      name="is_active"
      getValueLabel={(value: IsActiveOption) => value?.label}
    >
      <Field
        name="is_active"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={IsActiveOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: IsActiveOption) => String(option.value)}
            getOptionLabel={(option: IsActiveOption) => option.label}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const AdminAnnouncementsFilterFormId = 'AdminAnnouncementsFilter';

export interface AdminAnnouncementsFilterFormData {
  type: AdminAnnouncementTypeOption[];
  is_active: IsActiveOption;
}

type AdminAnnouncementsFilterQuery = AdminAnnouncementsListData['query'];

export const selectAdminAnnouncementsFilter = (
  values?: Partial<AdminAnnouncementsFilterFormData>,
): AdminAnnouncementsFilterQuery => {
  const filter: AdminAnnouncementsFilterQuery = {} as any;
  if (values) {
    if (values.type) {
      filter.type = values.type.map((v: any) => v.value);
    }
    if (values.is_active) {
      filter.is_active = values.is_active.value;
    }
  }
  return filter;
};
