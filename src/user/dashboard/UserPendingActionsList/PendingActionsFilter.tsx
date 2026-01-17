import { FC } from 'react';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { SelectField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import {
  PendingActionsFilter as PendingActionsFilterType,
  UrgencyLevel,
  UserPendingActionType,
} from './types';

export const USER_PENDING_ACTIONS_FILTER_FORM_ID = 'UserPendingActionsFilter';

// Action type options
const getActionTypeOptions = () => [
  {
    value: UserPendingActionType.EXPIRING_RESOURCE,
    label: translate('Expiring resource'),
  },
  {
    value: UserPendingActionType.PENDING_ORDER,
    label: translate('Pending order approval'),
  },
];

// Urgency options
const getUrgencyOptions = () => [
  { value: 'high' as UrgencyLevel, label: translate('High') },
  { value: 'medium' as UrgencyLevel, label: translate('Medium') },
  { value: 'low' as UrgencyLevel, label: translate('Low') },
];

// Filter component for pending actions
const PendingActionsFilter: FC = () => (
  <>
    <TableFilterItem
      title={translate('Action type')}
      name="action_type"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="action_type"
        component={SelectField}
        options={getActionTypeOptions()}
        placeholder={translate('All types')}
        isClearable
        noUpdateOnBlur
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Urgency')}
      name="urgency"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="urgency"
        component={SelectField}
        options={getUrgencyOptions()}
        placeholder={translate('All urgency levels')}
        isClearable
        noUpdateOnBlur
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Overdue')}
      name="overdue"
      badgeValue={(value) => (value ? translate('Overdue only') : null)}
    >
      <Field
        name="overdue"
        component={AwesomeCheckboxField}
        label={translate('Show overdue actions only')}
      />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Include silenced')}
      name="include_silenced"
      badgeValue={(value) => (value ? translate('Including silenced') : null)}
    >
      <Field
        name="include_silenced"
        component={AwesomeCheckboxField}
        label={translate('Include silenced actions')}
      />
    </TableFilterItem>
  </>
);

// Form wrapper for filters
export const PendingActionsFilterForm = reduxForm<any, any>({
  form: USER_PENDING_ACTIONS_FILTER_FORM_ID,
})(PendingActionsFilter);

// Selector to map form values to API filter
export const mapStateToFilter = createSelector(
  (state, formId) => getFormValues(formId)(state),
  (filters: PendingActionsFilterType) => {
    const filter: Record<string, string | boolean> = {};
    if (filters?.include_silenced) {
      filter.include_silenced = 'true';
    }
    if (filters?.action_type) {
      filter.action_type =
        typeof filters.action_type === 'object'
          ? (filters.action_type as { value: string }).value
          : filters.action_type;
    }
    if (filters?.urgency) {
      filter.urgency =
        typeof filters.urgency === 'object'
          ? (filters.urgency as { value: string }).value
          : filters.urgency;
    }
    if (filters?.overdue) {
      filter.overdue = 'true';
    }
    return filter;
  },
);
