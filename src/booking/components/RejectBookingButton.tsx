import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { bookingResourcesReject } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface RejectBookingButtonProps {
  resourceUuid: string;
  pending: boolean;
  isServiceProviderContext: boolean;
  refetch?: () => void;
}

export const RejectBookingButton: FC<RejectBookingButtonProps> = ({
  resourceUuid,
  pending,
  isServiceProviderContext,
  refetch,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const dispatch = useDispatch();

  const rejectRequest = async () => {
    try {
      setIsRejecting(true);
      await bookingResourcesReject({ path: { uuid: resourceUuid } });
      setIsRejecting(false);
      if (refetch) refetch();
      dispatch(showSuccess(translate('Booking has been cancelled.')));
      dispatch(closeModalDialog());
    } catch (e) {
      setIsRejecting(false);
      dispatch(showErrorResponse(e, translate('Unable to cancel booking.')));
    }
  };

  return (
    <SubmitButton
      disabled={pending}
      submitting={isRejecting}
      label={
        isServiceProviderContext ? translate('Deny') : translate('Cancel order')
      }
      className="btn btn-danger"
      onClick={rejectRequest}
    />
  );
};
