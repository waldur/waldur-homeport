// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { UrgencyEnum, UserActionsListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

export const ActionTypeOptions: ActionTypeOption[] = [
  {
    value: 'expiring_resource',
    label: translate('Expiring resource'),
  },
  {
    value: 'pending_order',
    label: translate('Pending order approval'),
  },
];
export interface ActionTypeOption {
  label: string;
  value: string;
}

export const UrgencyOptions: UrgencyOption[] = [
  {
    label: translate('High'),
    value: 'high',
  },
  {
    label: translate('Low'),
    value: 'low',
  },
  {
    label: translate('Medium'),
    value: 'medium',
  },
];
export interface UrgencyOption {
  label: string;
  value: UrgencyEnum;
}

const PureUserPendingActionsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Action type')}
      name="action_type"
      getValueLabel={(value: ActionTypeOption) => value?.label}
    >
      <Field
        name="action_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Action type')}
            options={ActionTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ActionTypeOption) => String(option.value)}
            getOptionLabel={(option: ActionTypeOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Urgency')}
      name="urgency"
      getValueLabel={(value: UrgencyOption) => value?.label}
    >
      <Field
        name="urgency"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Urgency')}
            options={UrgencyOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: UrgencyOption) => String(option.value)}
            getOptionLabel={(option: UrgencyOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Overdue')}
      name="overdue"
      badgeValue={(value) => (value ? translate('Overdue') : translate('All'))}
      ellipsis={false}
    >
      <Field
        name="overdue"
        component={AwesomeCheckboxField}
        label={translate('Overdue')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Include silenced')}
      name="include_silenced"
      badgeValue={(value) =>
        value ? translate('Include silenced') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="include_silenced"
        component={AwesomeCheckboxField}
        label={translate('Include silenced')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
  </>
);

export const UserPendingActionsFilterFormId = 'UserPendingActionsFilter';

interface UserPendingActionsFilterFormData {
  action_type: ActionTypeOption;
  urgency: UrgencyOption;
  overdue: boolean;
  include_silenced: boolean;
}

export const UserPendingActionsFilter = reduxForm<
  UserPendingActionsFilterFormData,
  {}
>({
  form: UserPendingActionsFilterFormId,
  destroyOnUnmount: false,
})(PureUserPendingActionsFilter);

type UserPendingActionsFilterQuery = UserActionsListData['query'];

export const selectUserPendingActionsFilter = createSelector<
  RootState,
  Partial<UserPendingActionsFilterFormData>,
  UserPendingActionsFilterQuery
>(getFormValues(UserPendingActionsFilterFormId), (values) => {
  const filter: UserPendingActionsFilterQuery = {} as any;
  if (values) {
    if (values.action_type) {
      filter.action_type = values.action_type.value;
    }
    if (values.urgency) {
      filter.urgency = values.urgency.value;
    }
    if (values.overdue) {
      filter.overdue = values.overdue;
    }
    if (values.include_silenced) {
      filter.include_silenced = values.include_silenced;
    }
  }
  return filter;
});
