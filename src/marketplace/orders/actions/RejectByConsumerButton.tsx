import { XCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceOrdersRejectByConsumer } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { OrderActionProps } from './types';

export const RejectByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, as, className, refetch }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceOrdersRejectByConsumer({ path: { uuid: order.uuid } });
        if (refetch) {
          await refetch();
        }
        dispatch(showSuccess(translate('Order has been rejected.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to reject order.')),
        );
      }
    },
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
        <LoadingSpinnerIcon className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={className}
          title={translate('Reject')}
          action={mutate}
          disabled={isLoading}
          iconNode={<XCircleIcon weight="bold" />}
          size="sm"
        />
      )}
    </>
  );
};
