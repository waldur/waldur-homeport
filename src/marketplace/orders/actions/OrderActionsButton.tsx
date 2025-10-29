import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@waldur/support/constants';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { MarkAsDoneButton } from './MarkAsDoneButton';
import { OrderConsumerActions } from './OrderConsumerActions';

export const OrderActionsButton = ({
  order,
  offering,
  loadData,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
  loadData;
}) => {
  const user = useSelector(getUser);
  const showCancelButton = useMemo(() => {
    return (
      order.can_terminate &&
      [SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE].includes(
        order.offering_type,
      ) &&
      ['executing', 'pending-consumer', 'pending-provider'].includes(
        order.state,
      ) &&
      hasPermission(user, {
        permission: PermissionEnum.CANCEL_ORDER,
        customerId: order.customer_uuid,
        projectId: order.project_uuid,
      })
    );
  }, [order, user]);

  const showApproveByProviderButton = useMemo(() => {
    return (
      order.state === 'pending-provider' &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.customer_uuid,
      })
    );
  }, [order, user]);

  const showMarkAsDoneButton = useMemo(() => {
    return (
      order.state === 'executing' &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.provider_uuid,
      })
    );
  }, [order, user]);

  return showCancelButton ||
    showApproveByProviderButton ||
    showMarkAsDoneButton ||
    order.state === 'pending-consumer' ? (
    <ActionsDropdownComponent label={translate('Actions')} labeled={true}>
      {showApproveByProviderButton && (
        <ApproveByProviderButton row={order} refetch={loadData} />
      )}
      {showMarkAsDoneButton && (
        <MarkAsDoneButton row={order} refetch={loadData} />
      )}
      {showCancelButton && (
        <CancelOrderButton uuid={order.uuid} loadData={loadData} />
      )}
      <OrderConsumerActions order={order} offering={offering} />
    </ActionsDropdownComponent>
  ) : null;
};
