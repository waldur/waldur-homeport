import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { EventDateFilter } from '@waldur/support/EventDateFilter';
import { EventGroupFilter } from '@waldur/support/EventGroupFilter';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { SUPPORT_EVENTS_LIST_FILTER_FORM_ID } from './constants';

const PureSupportEventsListFilter: FunctionComponent = () => (
  <TableFilterFormContainer form={SUPPORT_EVENTS_LIST_FILTER_FORM_ID}>
    <TableFilterItem title={translate('Event group')} name="feature">
      <EventGroupFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Date')}
      name="date"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <EventDateFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      badgeValue={(value) => value?.full_name}
    >
      <UserAutocomplete />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: SUPPORT_EVENTS_LIST_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const SupportEventsListFilter = enhance(PureSupportEventsListFilter);
