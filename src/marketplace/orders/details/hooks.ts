import { useMemo } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { getOrderType } from '../utils';

export const useOrderEditable = (order: OrderDetails) => {
  const user = useUser();
  return useMemo(
    () =>
      order &&
      order.state === 'pending-consumer' &&
      getOrderType(order).type === 'create' &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.customer_uuid,
        projectId: order.project_uuid,
      }),
    [order, user],
  );
};
