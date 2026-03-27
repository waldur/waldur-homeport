import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceOrdersApproveByConsumer } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useNotify } from '@waldur/store/hooks';
import { getUser } from '@waldur/workspace/selectors';

import { OrderActionProps } from './types';

const UploadPurchaseOrderDialog = lazyComponent(() =>
  import('./UploadPurchaseOrderDialog').then((module) => ({
    default: module.UploadPurchaseOrderDialog,
  })),
);

export const ApproveByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, offering, as, className, refetch }) => {
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
    // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
    <LoadingSpinnerIcon className="me-1" />
  ) : (
    <ActionItem
      as={as}
      className={classNames(className, 'w-100')}
      title={translate('Approve')}
      action={callback}
      disabled={isLoading}
      variant="primary"
      iconNode={<CheckCircleIcon weight="bold" />}
      tooltip={translate('You need approval to finish purchasing of services.')}
      size="sm"
    />
  );
};
