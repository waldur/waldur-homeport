import { useSelector, useDispatch } from 'react-redux';

import { acceptBooking } from '@waldur/booking/api';
import * as constants from '@waldur/booking/constants';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

export const AcceptAction = ({ resource, reInitResource }) => {
  const dispatch = useDispatch();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Accept booking'),
        translate(
          'Are you sure you want to accept a {name}?',
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
      const response = await acceptBooking(resource.uuid);
      await reInitResource(response);
      dispatch(showSuccess(translate('Booking has been accepted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to accept booking.')));
    }
  };

  return (
    <ActionItem
      title={translate('Accept')}
      action={callback}
      disabled={
        resource.state !== constants.BOOKING_CREATING ||
        (!isOwnerOrStaff && !isServiceManager)
      }
    />
  );
};
