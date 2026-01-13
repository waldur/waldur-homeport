import { FC } from 'react';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { PendingActionsFilter as PendingActionsFilterType } from './types';

export const USER_PENDING_ACTIONS_FILTER_FORM_ID = 'UserPendingActionsFilter';

// Filter component for pending actions
const PendingActionsFilter: FC = () => (
  <TableFilterItem
    title={translate('Show silenced actions')}
    name="include_silenced"
    badgeValue={(value) => (value ? translate('Including silenced') : null)}
  >
    <Field
      name="include_silenced"
      component={AwesomeCheckboxField}
      label={translate('Include silenced actions')}
    />
  </TableFilterItem>
);

// Form wrapper for filters
export const PendingActionsFilterForm = reduxForm<any, any>({
  form: USER_PENDING_ACTIONS_FILTER_FORM_ID,
})(PendingActionsFilter);

// Selector to map form values to API filter
export const mapStateToFilter = createSelector(
  (state, formId) => getFormValues(formId)(state),
  (filters: PendingActionsFilterType) => {
    const filter: any = {};
    if (filters?.include_silenced) {
      filter.include_silenced = 'true';
    }
    return filter;
  },
);
