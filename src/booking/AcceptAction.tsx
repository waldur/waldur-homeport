import { useSelector, useDispatch } from 'react-redux';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { acceptBooking } from './api';
import * as constants from './constants';

export const AcceptAction = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceProviderContext = resource.provider_uuid === customer.uuid;

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
      await refetch(response);
      dispatch(showSuccess(translate('Booking has been accepted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to accept booking.')));
    }
  };

  return isServiceProviderContext ? (
    <ActionItem
      title={translate('Accept')}
      action={callback}
      disabled={
        resource.state !== constants.BOOKING_CREATING ||
        !hasPermission(user, {
          permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
          customerId: customer.uuid,
        })
      }
    />
  ) : null;
};
