import { ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { remoteWaldurApiCancelTermination } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

export const CancelTerminationOrderButton = ({
  row,
  fetch,
}: {
  row: OrderResponse;
  fetch;
}) => {
  const user = useSelector(getUser);

  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await remoteWaldurApiCancelTermination({ path: { uuid: row.uuid } });
        await fetch();
        dispatch(showSuccess(translate('Order has been canceled.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to cancel order.')),
        );
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
