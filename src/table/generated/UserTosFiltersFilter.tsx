// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const UserHasConsentOptions: UserHasConsentOption[] = [
  {
    value: false,
    label: translate('Not accepted'),
  },
  {
    value: true,
    label: translate('Accepted'),
  },
];
export interface UserHasConsentOption {
  label: string;
  value: boolean;
}

export const UserTosFiltersFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Consent status')}
    name="user_has_consent"
    getValueLabel={(value: UserHasConsentOption) => value?.label}
  >
    <Field
      name="user_has_consent"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Consent status')}
          options={UserHasConsentOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: UserHasConsentOption) =>
            String(option.value)
          }
          getOptionLabel={(option: UserHasConsentOption) => option.label}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const UserTosFiltersFilterFormId = 'UserTosFiltersFilter';

export interface UserTosFiltersFilterFormData {
  user_has_consent: UserHasConsentOption;
}

type UserTosFiltersFilterQuery = MarketplacePublicOfferingsListData['query'];

export const selectUserTosFiltersFilter = (
  values?: Partial<UserTosFiltersFilterFormData>,
): UserTosFiltersFilterQuery => {
  const filter: UserTosFiltersFilterQuery = {} as any;
  if (values) {
    if (values.user_has_consent) {
      filter.user_has_consent = values.user_has_consent.value;
    }
  }
  return filter;
};
