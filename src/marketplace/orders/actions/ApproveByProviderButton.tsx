import { CheckIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersRetrieve,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { updateEntity } from '@waldur/table/actions';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

interface SupportOrderApproveButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const ApproveByProviderButton: FunctionComponent<
  SupportOrderApproveButtonProps
> = (props) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const isSiteAgentOrder = props.row.offering_type === SITE_AGENT_PLUGIN;

      if (isSiteAgentOrder) {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Approve order'),
            translate(
              'Provider approval is expected to be done by Waldur site agent. Doing it manually can lead to a broken state.',
            ),
          );
        } catch {
          return;
        }
      }

      try {
        await marketplaceOrdersApproveByProvider({
          path: { uuid: props.row.uuid },
        });
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
        dispatch(showSuccess(translate('Order has been approved.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to approve order.')),
        );
      }
    },
  });
  return (
    <ActionItem
      as={props.as}
      className={
        props.as === Button ? 'btn-light-success btn-sm w-100' : 'text-success'
      }
      title={translate('Approve')}
      action={mutate}
      disabled={isLoading}
      iconNode={<CheckIcon weight="bold" />}
      iconColor="success"
    />
  );
};
