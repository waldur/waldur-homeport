import { Check } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { approveOrderByConsumer } from '@waldur/marketplace/common/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { OrderActionProps } from './types';

export const ApproveByConsumerButton: FC<
  OrderActionProps & { className?: string }
> = ({ order, as, className, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await approveOrderByConsumer(order.uuid);
      if (refetch) {
        await refetch();
      }
      dispatch(showSuccess(translate('Order has been approved.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to approve order.')));
    }
  });
  if (
    !hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    })
  ) {
    return null;
  }
  return wrapTooltip(
    translate('You need approval to finish purchasing of services.'),
    <>
      {isLoading ? (
        <LoadingSpinnerIcon className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={className}
          title={translate('Approve')}
          action={mutate}
          disabled={isLoading}
          iconNode={<Check />}
        />
      )}
    </>,
  );
};
