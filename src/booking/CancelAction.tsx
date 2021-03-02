import { useSelector, useDispatch } from 'react-redux';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { rejectBooking } from './api';
import * as constants from './constants';

export const CancelAction = ({ resource, reInitResource }) => {
  const dispatch = useDispatch();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Cancel booking'),
        translate(
          'Are you sure you want to cancel a {name}?',
          {
            name: <b>{resource.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      const response = await rejectBooking(resource.uuid);
      await reInitResource(response);
      dispatch(showSuccess(translate('Booking has been cancelled.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to cancel booking.')));
    }
  };

  return isServiceManager ? null : (
    <ActionItem
      title={translate('Cancel')}
      action={callback}
      disabled={
        resource.state !== constants.BOOKING_CREATING || !isOwnerOrStaff
      }
    />
  );
};
