// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  AdminAnnouncementTypeEnum,
  AdminAnnouncementsListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const AdminAnnouncementTypeEnumChoices: AdminAnnouncementTypeEnumChoicesOption[] =
  [
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
export interface AdminAnnouncementTypeEnumChoicesOption {
  label: string;
  value: AdminAnnouncementTypeEnum;
}

export const IsActiveChoices: IsActiveChoicesOption[] = [
  {
    label: translate('Inactive'),
    value: false,
  },
  {
    label: translate('Active'),
    value: true,
  },
];
export interface IsActiveChoicesOption {
  label: string;
  value: boolean;
}

const PureAdminAnnouncementsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Type')}
      name="type"
      getValueLabel={(value: AdminAnnouncementTypeEnumChoicesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Type')}
            options={AdminAnnouncementTypeEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AdminAnnouncementTypeEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AdminAnnouncementTypeEnumChoicesOption) =>
              option.label
            }
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Status')}
      name="is_active"
      getValueLabel={(value: IsActiveChoicesOption) => value?.label}
    >
      <Field
        name="is_active"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={IsActiveChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: IsActiveChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: IsActiveChoicesOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const AdminAnnouncementsFilterFormId = 'AdminAnnouncementsFilter';

interface AdminAnnouncementsFilterFormData {
  type: AdminAnnouncementTypeEnumChoicesOption[];
  is_active: IsActiveChoicesOption;
}

export const AdminAnnouncementsFilter = reduxForm<
  AdminAnnouncementsFilterFormData,
  {}
>({
  form: AdminAnnouncementsFilterFormId,
  destroyOnUnmount: false,
})(PureAdminAnnouncementsFilter);

type AdminAnnouncementsFilterQuery = AdminAnnouncementsListData['query'];

export const selectAdminAnnouncementsFilter = createSelector<
  RootState,
  Partial<AdminAnnouncementsFilterFormData>,
  AdminAnnouncementsFilterQuery
>(getFormValues(AdminAnnouncementsFilterFormId), (values) => {
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
});
