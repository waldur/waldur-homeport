import { ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { remoteWaldurApiCancelTermination } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

export const CancelTerminationOrderButton = ({
  row,
  fetch,
}: {
  row: OrderResponse;
  fetch;
}) => {
  const user = useUser();

  const { showErrorResponse, showSuccess } = useNotify();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await remoteWaldurApiCancelTermination({ path: { uuid: row.uuid } });
        await fetch();
        showSuccess(translate('Order has been canceled.'));
      } catch (response) {
        showErrorResponse(response, translate('Unable to cancel order.'));
      }
    },
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
        disabled={isLoading}
        iconNode={<ProhibitIcon weight="bold" />}
        size="sm"
      />
    );
  }
  return null;
};
