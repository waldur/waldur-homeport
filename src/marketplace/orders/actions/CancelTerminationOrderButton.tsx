import { ProhibitIcon } from '@phosphor-icons/react';
import { remoteWaldurApiCancelTermination } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const CancelTerminationOrderButton = ({
  row,
  fetch,
}: {
  row: OrderResponse;
  fetch;
}) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      remoteWaldurApiCancelTermination({ path: { uuid: row.uuid } }),
    successMessage: translate('Order has been canceled.'),
    errorMessage: translate('Unable to cancel order.'),
    refetch: fetch,
  });

  if (
    user.is_staff &&
    row.type === 'Terminate' &&
    row.state === 'executing' &&
    row.offering_type === REMOTE_OFFERING_TYPE
  ) {
    return (
      <ActionItem
        title={translate('Cancel')}
        action={mutate}
        disabled={isPending}
        iconNode={<ProhibitIcon weight="bold" />}
        size="sm"
      />
    );
  }
  return null;
};
