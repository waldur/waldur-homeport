import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceOrdersApproveByConsumer } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/hooks';
import { getUser } from '@/workspace/selectors';

import { OrderActionProps } from './types';

const UploadPurchaseOrderDialog = lazyComponent(() =>
  import('./UploadPurchaseOrderDialog').then((module) => ({
    default: module.UploadPurchaseOrderDialog,
  })),
);

export const ApproveByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, offering, as, className, refetch, size }) => {
  const user = useSelector(getUser);
  const { openDialog, closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceOrdersApproveByConsumer({
          path: { uuid: order.uuid },
        });
        if (refetch) {
          await refetch();
        }
        // Close modal dialog, if performed action from there
        closeDialog();
        showSuccess(translate('Order has been approved.'));
      } catch (error) {
        showErrorResponse(error, translate('Unable to approve order.'));
      }
    },
  });
  const callback = () => {
    if (offering?.plugin_options?.['enable_purchase_order_upload']) {
      openDialog(UploadPurchaseOrderDialog, {
        order,
        refetch,
        required: offering?.plugin_options['require_purchase_order_upload'],
      });
    } else {
      mutate();
    }
  };
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
