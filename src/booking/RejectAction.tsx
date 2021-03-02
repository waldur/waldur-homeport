import { useSelector, useDispatch } from 'react-redux';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { isServiceManagerSelector } from '@waldur/workspace/selectors';

import { rejectBooking } from './api';
import * as constants from './constants';

export const RejectAction = ({ resource, reInitResource }) => {
  const dispatch = useDispatch();
  const isServiceManager = useSelector(isServiceManagerSelector);

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Reject booking'),
        translate(
          'Are you sure you want to reject a {name}?',
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
      dispatch(showSuccess(translate('Booking has been rejected.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to reject booking.')));
    }
  };

  return isServiceManager ? (
    <ActionItem
      title={translate('Reject')}
      action={callback}
      disabled={resource.state !== constants.BOOKING_CREATING}
    />
  ) : null;
};
