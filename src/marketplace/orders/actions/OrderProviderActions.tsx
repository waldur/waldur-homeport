import { useMemo } from 'react';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';
import { RejectByProviderButton } from './RejectByProviderButton';
import { SetProviderInfoButton } from './SetProviderInfoButton';
import { OrderActionProps } from './types';

export const OrderProviderActions = ({
  order,
  offering,
  refetch,
  as,
  size,
  labeledDropdown,
}: OrderActionProps) => {
  const user = useUser();

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

  const showRequestInfoButton = useMemo(() => {
    return (
      offering?.plugin_options?.['enable_provider_consumer_messaging'] &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.provider_uuid,
      })
    );
  }, [order, offering, user]);

  if (
    !showApproveByProviderButton &&
    !showRejectByProviderButton &&
    !showRequestInfoButton
  ) {
    return null;
  }

  return as === ActionButton ? (
    <>
      {showApproveByProviderButton && (
        <ApproveByProviderButton
          row={order}
          refetch={refetch}
          as={ActionButton}
        />
      )}
      {showRejectByProviderButton && (
        <RejectByProviderButton
          row={order}
          refetch={refetch}
          as={ActionButton}
        />
      )}
      {showRequestInfoButton && (
        <SetProviderInfoButton
          row={order}
          refetch={refetch}
          as={ActionButton}
        />
      )}
    </>
  ) : (
    <ActionsDropdown
      row={order}
      refetch={refetch}
      actions={[
        showApproveByProviderButton ? ApproveByProviderButton : null,
        showRejectByProviderButton ? RejectByProviderButton : null,
        showRequestInfoButton ? SetProviderInfoButton : null,
        user?.is_staff ? OrderUnlinkButton : null,
      ].filter(Boolean)}
      data-cy="order-provider-actions-dropdown-btn"
      labeled={labeledDropdown}
      drop="down"
      size={size || 'lg'}
    />
  );
};
