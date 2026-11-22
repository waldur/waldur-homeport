import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersRejectByConsumer,
  Resource,
} from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';
import { BaseButton } from 'waldur-ui';

import { useCanApproveOrder, useCanSeeOrder } from './queries';

/**
 * Whether the person who asked can still withdraw a request: only while it
 * waits for approval, and only if they can reach the order. The orders API
 * cancels only Basic and Support orders, so a requester withdraws by
 * rejecting it as consumer, which the backend allows its creator then.
 */
export const canWithdrawRequest = (
  state: string | undefined,
  isRequester: boolean,
  canSeeOrder: boolean,
) => isRequester && canSeeOrder && state === 'pending-consumer';

/**
 * Approve and Decline for whoever may approve a requested service, and
 * Withdraw for whoever asked. Nothing for anyone else: the card already
 * says who approves.
 */
export const RequestActions = ({
  resource,
  username,
}: {
  resource: Resource;
  username?: string;
}) => {
  const order = resource.order_in_progress;
  const waiting = order?.state === 'pending-consumer';
  const canApprove = useCanApproveOrder(resource.uuid, waiting);
  const isRequester = !!username && order?.created_by_username === username;
  const canSee = useCanSeeOrder(order?.uuid ?? '', waiting && isRequester);
  const name = resource.offering_name;

  const approve = useManagedMutation({
    mutationFn: () =>
      marketplaceOrdersApproveByConsumer({ path: { uuid: order.uuid } }),
    confirmation: {
      title: translate('Add {name} to the project?', { name }),
      body: translate(
        'The provider then sets it up. The project pays for what its keys use, within the limits asked for.',
      ),
      options: {
        type: 'success',
        positiveButton: translate('Approve'),
        negativeButton: translate('Not now'),
      },
    },
    closeModal: false,
    successMessage: translate('{name} is approved', { name }),
    successDescription: translate('The provider sets it up next.'),
    errorMessage: translate('Could not approve {name}.', { name }),
  });
  const decline = useManagedMutation<unknown, unknown, { input?: string }>({
    mutationFn: ({ input }) =>
      marketplaceOrdersRejectByConsumer({
        path: { uuid: order.uuid },
        body: { consumer_rejection_comment: input ?? '' },
      }),
    confirmation: {
      title: translate('Decline {name}?', { name }),
      body: translate('Whoever asked for it sees your reason.'),
      options: {
        type: 'danger',
        positiveButton: translate('Decline'),
        positiveButtonVariant: 'danger',
        negativeButton: translate('Not now'),
        showInput: true,
        inputLabel: translate('Reason'),
      },
    },
    closeModal: false,
    successMessage: translate('{name} is declined', { name }),
    errorMessage: translate('Could not decline {name}.', { name }),
  });
  const withdraw = useManagedMutation({
    mutationFn: () =>
      marketplaceOrdersRejectByConsumer({
        path: { uuid: order.uuid },
        body: {
          consumer_rejection_comment: translate('Withdrawn by {name}.', {
            name: order.created_by_full_name || order.created_by_username,
          }),
        },
      }),
    confirmation: {
      title: translate('Withdraw the request for {name}?', { name }),
      body: translate('Nothing has been set up or billed for it.'),
      options: {
        type: 'warning',
        positiveButton: translate('Withdraw'),
        negativeButton: translate('Keep it'),
      },
    },
    closeModal: false,
    successMessage: translate('The request for {name} is withdrawn', { name }),
    errorMessage: translate('Could not withdraw the request.'),
  });

  if (!waiting) return null;
  if (canApprove.data) {
    return (
      <div className="flex flex-wrap gap-2">
        <BaseButton
          variant="primary"
          iconNode={<CheckIcon weight="bold" />}
          label={translate('Approve')}
          pending={approve.isPending}
          onClick={() => approve.mutate(undefined)}
        />
        <BaseButton
          variant="tertiary"
          iconNode={<XIcon weight="bold" />}
          label={translate('Decline')}
          pending={decline.isPending}
          onClick={() => decline.mutate({})}
        />
      </div>
    );
  }
  if (canWithdrawRequest(order.state, isRequester, !!canSee.data)) {
    return (
      <BaseButton
        variant="tertiary"
        label={translate('Withdraw request')}
        pending={withdraw.isPending}
        onClick={() => withdraw.mutate(undefined)}
      />
    );
  }
  return null;
};
