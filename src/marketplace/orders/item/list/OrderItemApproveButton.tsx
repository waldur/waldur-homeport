import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { approveOrderItem, getOrderItem } from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { updateEntity } from '@waldur/table/actions';

import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from './constants';

interface OrderItemApproveButtonProps {
  uuid: string;
  refetch: () => void;
}

export const OrderItemApproveButton: React.FC<OrderItemApproveButtonProps> = (
  props,
) => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const handler = React.useCallback(async () => {
    setLoading(true);
    try {
      await approveOrderItem(props.uuid);
      const newOrderItem = await getOrderItem(props.uuid);
      // update order items table on the main page
      dispatch(updateEntity(TABLE_PUBLIC_ORDERS, props.uuid, newOrderItem));
      // update pending order items tables on the drawer
      dispatch(
        updateEntity(TABLE_PENDING_PUBLIC_ORDERS, props.uuid, newOrderItem),
      );
      dispatch(
        updateEntity(
          TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
          props.uuid,
          newOrderItem,
        ),
      );
      await props.refetch();
      dispatch(showSuccess(translate('Order item has been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to approve order item.')),
      );
    }

    setLoading(false);
  }, [setLoading, dispatch, props.uuid, fetch]);
  return (
    <ActionButton
      className="btn btn-sm btn-secondary me-2"
      title={translate('Approve')}
      action={handler}
      disabled={loading}
      icon={loading ? 'fa fa-spinner fa-spin' : 'fa fa-check'}
    />
  );
};
