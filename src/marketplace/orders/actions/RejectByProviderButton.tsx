import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersRejectByProvider,
  marketplaceOrdersRetrieve,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@/marketplace/orders/list/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import { ActionButton } from '@/table/ActionButton';
import { updateEntity } from '@/table/actions';

interface RejectByProviderButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
  size?: 'sm';
}

export const RejectByProviderButton: FunctionComponent<
  RejectByProviderButtonProps
> = (props) => {
  const dispatch = useDispatch();

  const { mutate, isPending: isLoading } = useManagedMutation<any, any, any>({
    mutationFn: (result) =>
      marketplaceOrdersRejectByProvider({
        path: { uuid: props.row.uuid },
        body: { provider_rejection_comment: result?.input },
      }),
    successMessage: translate('Order has been rejected.'),
    errorMessage: translate('Unable to reject order.'),
    confirmation: {
      title: translate('Reject order'),
      body:
        props.row.offering_type === SITE_AGENT_PLUGIN
          ? translate(
              'Provider rejection is expected to be done by Waldur site agent. Doing it manually can lead to a broken state.',
            )
          : translate('Are you sure you want to reject this order?'),
      options: {
        showInput: true,
        inputLabel: translate('Rejection reason (optional)'),
        positiveButton: translate('Reject'),
      },
    },
    onSuccess: async () => {
      const newOrder = await marketplaceOrdersRetrieve({
        path: { uuid: props.row.uuid },
      }).then((response) => response.data);
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
    },
  });
  return (
    <ActionItem
      as={props.as}
      className={props.as === ActionButton ? 'w-100' : 'text-danger'}
      title={translate('Decline')}
      action={mutate}
      disabled={isLoading}
      variant="danger"
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
