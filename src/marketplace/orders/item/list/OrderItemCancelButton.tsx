import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { cancelTerminationOrderItem } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const OrderItemCancelButton = ({ row, fetch }) => {
  const user = useSelector(getUser);

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handler = useCallback(async () => {
    setLoading(true);
    try {
      await cancelTerminationOrderItem(row.uuid);
      await fetch();
      dispatch(showSuccess(translate('Order item has been canceled.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to cancel order item.')),
      );
    }
    setLoading(false);
  }, [setLoading, dispatch, row.uuid, fetch]);

  if (
    user.is_staff &&
    row.type === 'Terminate' &&
    row.state === 'executing' &&
    row.offering_type === REMOTE_OFFERING_TYPE
  ) {
    return (
      <ActionButton
        className="btn btn-sm btn-secondary me-2"
        title={translate('Cancel')}
        action={handler}
        disabled={loading}
        icon={loading ? 'fa fa-spinner fa-spin' : 'fa fa-cancel'}
      />
    );
  }
  return null;
};
