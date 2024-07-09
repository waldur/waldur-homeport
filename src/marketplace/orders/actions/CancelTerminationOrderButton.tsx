import { Prohibit } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { cancelTerminationOrder } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { OrderResponse } from '../types';

export const CancelTerminationOrderButton = ({
  row,
  fetch,
}: {
  row: OrderResponse;
  fetch;
}) => {
  const user = useSelector(getUser);

  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await cancelTerminationOrder(row.uuid);
      await fetch();
      dispatch(showSuccess(translate('Order has been canceled.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to cancel order.')),
      );
    }
  });

  if (
    user.is_staff &&
    row.type === 'Terminate' &&
    row.state === 'executing' &&
    row.offering_type === REMOTE_OFFERING_TYPE
  ) {
    return (
      <RowActionButton
        className="btn btn-sm btn-secondary me-2"
        title={translate('Cancel')}
        action={mutate}
        pending={isLoading}
        iconNode={<Prohibit />}
        size="sm"
      />
    );
  }
  return null;
};
