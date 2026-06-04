// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AdminAnnouncementTypeEnum,
  AdminAnnouncementsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

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
    <SelectFilter
      title={translate('Type')}
      name="type"
      getValueLabel={(value: AdminAnnouncementTypeOption) => value?.label}
      placeholder={translate('Type')}
      options={AdminAnnouncementTypeOptions}
      getOptionValue={(option: AdminAnnouncementTypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: AdminAnnouncementTypeOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <SelectFilter
      title={translate('Status')}
      name="is_active"
      getValueLabel={(value: IsActiveOption) => value?.label}
      placeholder={translate('Status')}
      options={IsActiveOptions}
      getOptionValue={(option: IsActiveOption) => String(option.value)}
      getOptionLabel={(option: IsActiveOption) => option.label}
      isClearable={true}
    />
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
