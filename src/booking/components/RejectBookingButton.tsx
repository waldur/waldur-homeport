import { FC } from 'react';
import { bookingResourcesReject } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const rejectMutation = useManagedMutation<any, any, void>({
    mutationFn: () => bookingResourcesReject({ path: { uuid: resourceUuid } }),
    successMessage: translate('Booking has been cancelled.'),
    errorMessage: translate('Unable to cancel booking.'),
    refetch,
  });

  return (
    <SubmitButton
      disabled={pending}
      submitting={rejectMutation.isPending}
      label={
        isServiceProviderContext ? translate('Deny') : translate('Cancel order')
      }
      className="btn btn-danger"
      onClick={() => rejectMutation.mutate()}
    />
  );
};
