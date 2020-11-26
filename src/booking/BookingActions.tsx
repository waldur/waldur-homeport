import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import * as constants from '@waldur/booking/constants';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser, isOwner } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { acceptBookingItem, rejectBookingItem } from './store/actions';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  isOwner: isOwner(state),
  filter: getFormValues(BOOKINGS_FILTER_FORM_ID)(state),
});

const mapDispatchToProps = { acceptBookingItem, rejectBookingItem };

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  actions: [
    {
      label: translate('Accept'),
      handler: () =>
        dispatchProps.acceptBookingItem({
          ...ownProps.row,
          filterState: stateProps.filter.state,
          offeringUuid: ownProps.offeringUuid,
          providerUuid: ownProps.providerUuid,
        }),
      visible:
        ownProps.row.state === constants.BOOKING_CREATED &&
        (stateProps.user.is_staff || stateProps.isOwner),
    },
    {
      label: translate('Reject'),
      handler: () =>
        dispatchProps.rejectBookingItem({
          ...ownProps.row,
          filterState: stateProps.filter.state,
          offeringUuid: ownProps.offeringUuid,
          providerUuid: ownProps.providerUuid,
        }),
      visible:
        ownProps.row.state === constants.BOOKING_CREATED &&
        (stateProps.user.is_staff || stateProps.isOwner),
    },
  ].filter((row) => row.visible),
});

const Actions = ({ actions }) => (
  <div className={classNames('btn-group', { disabled: actions.length === 0 })}>
    {actions.map((action, index) => (
      <ActionButton key={index} title={action.label} action={action.handler} />
    ))}
  </div>
);

export const BookingActions = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(Actions);
