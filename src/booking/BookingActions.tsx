import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

import * as constants from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { acceptBookingItem, rejectBookingItem } from './store/actions';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
});

const mapDispatchToProps = { acceptBookingItem, rejectBookingItem };

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  actions: [
    {
      label: translate('Accept'),
      handler: () =>
        dispatchProps.acceptBookingItem(ownProps.row) && ownProps.refresh(),
      visible:
        ownProps.row.state === constants.BOOKING_CREATED &&
        stateProps.user.is_staff,
    },
    {
      label: translate('Reject'),
      handler: () =>
        dispatchProps.rejectBookingItem(ownProps.row) && ownProps.refresh(),
      visible:
        ownProps.row.state === constants.BOOKING_CREATED &&
        stateProps.user.is_staff,
    },
  ].filter(row => row.visible),
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
