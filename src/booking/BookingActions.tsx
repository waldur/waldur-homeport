import classNames from 'classnames';
import { connect } from 'react-redux';

import * as constants from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser, isOwner } from '@waldur/workspace/selectors';

import { acceptBookingItem, rejectBookingItem } from './store/actions';
import { bookingFormSelector } from './store/selectors';
import { BookingResource } from './types';

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  isOwner: isOwner(state),
  filter: bookingFormSelector(state),
});

const mapDispatchToProps = { acceptBookingItem, rejectBookingItem };

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = typeof mapDispatchToProps;

type OwnProps = {
  row: BookingResource;
  offeringUuid: string;
  providerUuid: string;
};

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps,
) => ({
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
