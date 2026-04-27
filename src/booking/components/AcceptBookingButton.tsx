import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bookingResourcesAccept } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { getCustomer, getUser } from '@/workspace/selectors';

interface AcceptBookingButtonProps {
  resourceUuid: string;
  pending: boolean;
  refetch?: () => void;
}

export const AcceptBookingButton: FC<AcceptBookingButtonProps> = ({
  resourceUuid,
  pending,
  refetch,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const acceptRequest = async () => {
    try {
      setIsAccepting(true);
      await bookingResourcesAccept({ path: { uuid: resourceUuid } });
      setIsAccepting(false);
      if (refetch) refetch();
      dispatch(showSuccess(translate('Booking has been accepted.')));
      dispatch(closeModalDialog());
    } catch (e) {
      setIsAccepting(false);
      dispatch(showErrorResponse(e, translate('Unable to accept booking.')));
    }
  };

  return (
    <SubmitButton
      disabled={
        pending ||
        !hasPermission(user, {
          permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
          customerId: customer.uuid,
        })
      }
      submitting={isAccepting}
      label={translate('Accept')}
      className="btn btn-success me-2"
      onClick={acceptRequest}
    />
  );
};
