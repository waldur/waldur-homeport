import { FC } from 'react';
import { useSelector } from 'react-redux';
import { bookingResourcesAccept } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

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
  const user = useUser();
  const customer = useSelector(getCustomer);

  const acceptMutation = useManagedMutation<any, any, void>({
    mutationFn: () => bookingResourcesAccept({ path: { uuid: resourceUuid } }),
    successMessage: translate('Booking has been accepted.'),
    errorMessage: translate('Unable to accept booking.'),
    refetch,
  });

  return (
    <SubmitButton
      disabled={
        pending ||
        !hasPermission(user, {
          permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
          customerId: customer.uuid,
        })
      }
      submitting={acceptMutation.isPending}
      label={translate('Accept')}
      className="btn btn-success me-2"
      onClick={() => acceptMutation.mutate()}
    />
  );
};
