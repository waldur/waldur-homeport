import { Prohibit } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getOrder,
  rejectOrderByProvider,
} from '@waldur/marketplace/common/api';
import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { updateEntity } from '@waldur/table/actions';

import { OrderResponse } from '../types';

interface RejectByProviderButtonProps {
  row: OrderResponse;
  refetch?: () => void;
}

export const RejectByProviderButton: FunctionComponent<
  RejectByProviderButtonProps
> = (props) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await rejectOrderByProvider(props.row.uuid);
      const newOrder = await getOrder(props.row.uuid);
      dispatch(
        updateEntity(TABLE_MARKETPLACE_ORDERS, props.row.uuid, newOrder),
      );
      // update orders table on the main page
      dispatch(updateEntity(TABLE_PUBLIC_ORDERS, props.row.uuid, newOrder));
      // update pending orders tables on the drawer
      dispatch(
        updateEntity(TABLE_PENDING_PUBLIC_ORDERS, props.row.uuid, newOrder),
      );
      dispatch(
        updateEntity(
          TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
          props.row.uuid,
          newOrder,
        ),
      );

      if (props.refetch) await props.refetch();

      dispatch(showSuccess(translate('Order has been rejected.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to reject order.')),
      );
    }
  });
  return (
    <ActionItem
      className="text-danger"
      title={translate('Reject')}
      action={mutate}
      disabled={isLoading}
      iconNode={<Prohibit />}
    />
  );
};
