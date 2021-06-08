import { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  approveOrderItem,
  getOrderDetails,
} from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { updateEntity } from '@waldur/table/actions';

import { TABLE_SUPPORT_ORDERS } from './constants';

interface SupportOrderItemApproveButtonProps {
  itemUuid: string;
  orderUuid: string;
}

export const SupportOrderItemApproveButton: FunctionComponent<SupportOrderItemApproveButtonProps> = (
  props,
) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handler = useCallback(async () => {
    setLoading(true);
    try {
      await approveOrderItem(props.itemUuid);
      const order = await getOrderDetails(props.orderUuid);
      dispatch(updateEntity(TABLE_SUPPORT_ORDERS, props.orderUuid, order));
      dispatch(showSuccess(translate('Order item has been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to approve order item.')),
      );
    }
    setLoading(false);
  }, [setLoading, dispatch, props.itemUuid]);
  return (
    <ActionButton
      className="btn btn-sm btn-default"
      title={translate('Approve')}
      action={handler}
      disabled={loading}
      icon={loading ? 'fa fa-spinner fa-spin' : 'fa fa-check'}
    />
  );
};
