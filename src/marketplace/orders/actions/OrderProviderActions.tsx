import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';
import { RejectByProviderButton } from './RejectByProviderButton';
import { OrderActionProps } from './types';

export const OrderProviderActions = ({
  order,
  refetch,
  as,
  size,
  labeledDropdown,
}: OrderActionProps) => {
  const user = useSelector(getUser);

  if (order.state !== 'pending-provider') {
    return null;
  }

  const showApproveByProviderButton = useMemo(() => {
    return hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: order.provider_uuid,
    });
  }, [order, user]);

  const showRejectByProviderButton = useMemo(() => {
    return hasPermission(user, {
      permission: PermissionEnum.REJECT_ORDER,
      customerId: order.provider_uuid,
    });
  }, [order, user]);

  return as === Button ? (
    <>
      {showApproveByProviderButton && (
        <ApproveByProviderButton row={order} refetch={refetch} as={Button} />
      )}
      {showRejectByProviderButton && (
        <RejectByProviderButton row={order} refetch={refetch} as={Button} />
      )}
    </>
  ) : (
    <ActionsDropdown
      row={order}
      refetch={refetch}
      actions={[
        showApproveByProviderButton ? ApproveByProviderButton : null,
        showRejectByProviderButton ? RejectByProviderButton : null,
        user?.is_staff ? OrderUnlinkButton : null,
      ].filter(Boolean)}
      data-cy="order-provider-actions-dropdown-btn"
      labeled={labeledDropdown}
      drop="down"
      size={size || 'md'}
    />
  );
};
