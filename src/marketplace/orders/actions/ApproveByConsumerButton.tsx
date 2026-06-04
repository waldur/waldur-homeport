import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { marketplaceOrdersApproveByConsumer } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { OrderActionProps } from './types';

const UploadPurchaseOrderDialog = lazyComponent(() =>
  import('./UploadPurchaseOrderDialog').then((module) => ({
    default: module.UploadPurchaseOrderDialog,
  })),
);

export const ApproveByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, offering, as, className, refetch, size }) => {
  const user = useUser();
  const { openDialog } = useModal();

  const { mutate, isPending: isLoading } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOrdersApproveByConsumer({
        path: { uuid: order.uuid },
      }),
    refetch,
    successMessage: translate('Order has been approved.'),
    errorMessage: translate('Unable to approve order.'),
  });

  const callback = useCallback(() => {
    if (
      offering?.plugin_options?.enable_purchase_order_upload ||
      offering?.plugin_options?.require_purchase_order_upload
    ) {
      openDialog(UploadPurchaseOrderDialog, {
        order,
        refetch,
        required: Boolean(
          offering?.plugin_options?.require_purchase_order_upload,
        ),
      });
    } else {
      mutate();
    }
  }, [offering, openDialog, order, refetch, mutate]);

  if (
    !hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    })
  ) {
    return null;
  }

  return isLoading ? (
    <LoadingSpinnerSimple className="me-1" />
  ) : (
    <ActionItem
      as={as}
      className={className}
      title={translate('Approve')}
      action={callback}
      disabled={isLoading}
      variant="secondary"
      iconNode={<CheckCircleIcon weight="bold" />}
      tooltip={translate('You need approval to finish purchasing of services.')}
      size={size}
    />
  );
};
