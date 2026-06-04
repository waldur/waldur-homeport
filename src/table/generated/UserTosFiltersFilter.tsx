// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

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
  <SelectFilter
    title={translate('Consent status')}
    name="user_has_consent"
    getValueLabel={(value: UserHasConsentOption) => value?.label}
    placeholder={translate('Consent status')}
    options={UserHasConsentOptions}
    getOptionValue={(option: UserHasConsentOption) => String(option.value)}
    getOptionLabel={(option: UserHasConsentOption) => option.label}
    isClearable={true}
  />
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
