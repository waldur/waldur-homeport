// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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

const PureUserTosFiltersFilter: FunctionComponent<{}> = () => (
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

interface UserTosFiltersFilterFormData {
  user_has_consent: UserHasConsentOption;
}

export const UserTosFiltersFilter = reduxForm<UserTosFiltersFilterFormData, {}>(
  {
    form: UserTosFiltersFilterFormId,
    destroyOnUnmount: false,
  },
)(PureUserTosFiltersFilter);

type UserTosFiltersFilterQuery = MarketplacePublicOfferingsListData['query'];

export const selectUserTosFiltersFilter = createSelector<
  RootState,
  Partial<UserTosFiltersFilterFormData>,
  UserTosFiltersFilterQuery
>(getFormValues(UserTosFiltersFilterFormId), (values) => {
  const filter: UserTosFiltersFilterQuery = {} as any;
  if (values) {
    if (values.user_has_consent) {
      filter.user_has_consent = values.user_has_consent.value;
    }
  }
  return filter;
});
