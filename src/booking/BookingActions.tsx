import { ButtonGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import * as constants from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { acceptBookingItem, rejectBookingItem } from './store/actions';

export const BookingActions = ({ row, onRefresh }) => {
  const dispatch = useDispatch();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (
    row.state === constants.BOOKING_CREATING &&
    (isOwnerOrStaff || isServiceManager)
  ) {
    return (
      <ButtonGroup>
        <ActionButton
          title={translate('Accept')}
          action={() => dispatch(acceptBookingItem({ row, onRefresh }))}
        />
        <ActionButton
          title={translate('Reject')}
          action={() => dispatch(rejectBookingItem({ row, onRefresh }))}
        />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
