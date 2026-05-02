import { XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceOrdersRejectByConsumer } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { OrderActionProps } from './types';

export const RejectByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, as, className, refetch, size }) => {
  const user = useUser();

  const { mutate, isPending: isLoading } = useManagedMutation<any, any, any>({
    mutationFn: (variables) =>
      marketplaceOrdersRejectByConsumer({
        path: { uuid: order.uuid },
        body: { consumer_rejection_comment: variables?.input },
      }),
    confirmation: {
      title: translate('Reject order'),
      body: translate('Are you sure you want to reject this order?'),
      options: {
        showInput: true,
        inputLabel: translate('Rejection reason (optional)'),
        positiveButton: translate('Reject'),
      },
    },
    successMessage: translate('Order has been rejected.'),
    errorMessage: translate('Unable to reject order.'),
    refetch,
  });
  if (
    !hasPermission(user, {
      permission: PermissionEnum.REJECT_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    })
  ) {
    return null;
  }
  return (
    <>
      {isLoading ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={className ?? 'text-danger'}
          title={translate('Decline')}
          action={mutate}
          disabled={isLoading}
          variant="danger"
          iconNode={<XCircleIcon weight="bold" />}
          iconColor="danger"
          size={size}
        />
      )}
    </>
  );
};
