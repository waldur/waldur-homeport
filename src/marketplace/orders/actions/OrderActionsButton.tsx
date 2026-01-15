import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@waldur/support/constants';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { MarkAsDoneButton } from './MarkAsDoneButton';
import { OrderConsumerActions } from './OrderConsumerActions';
import { OrderProviderActions } from './OrderProviderActions';

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

  // Hide provider actions for site agent offerings when display is disabled
  const hideProviderActions =
    order.offering_type === SITE_AGENT_PLUGIN &&
    !offering?.plugin_options
      ?.enable_display_of_order_actions_for_service_provider;

  const showCancelButton = useMemo(() => {
    return (
      order.can_terminate &&
      [SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE].includes(
        order.offering_type,
      ) &&
      ['executing', 'pending-consumer'].includes(order.state) &&
      hasPermission(user, {
        permission: PermissionEnum.CANCEL_ORDER,
        customerId: order.customer_uuid,
        projectId: order.project_uuid,
      })
    );
  }, [order, user]);

  const showMarkAsDoneButton = useMemo(() => {
    // For SITE_AGENT_PLUGIN, respect the provider actions display setting
    if (order.offering_type === SITE_AGENT_PLUGIN && hideProviderActions) {
      return false;
    }
    return (
      order.state === 'executing' &&
      [SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE, SITE_AGENT_PLUGIN].includes(
        order.offering_type,
      ) &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.provider_uuid,
      })
    );
  }, [order, user, hideProviderActions]);

  if (order.state === 'pending-provider' && !hideProviderActions) {
    return (
      <OrderProviderActions order={order} refetch={loadData} labeledDropdown />
    );
  }

  return showCancelButton ||
    showMarkAsDoneButton ||
    order.state === 'pending-consumer' ? (
    <ActionsDropdownComponent label={translate('Actions')} labeled size="lg">
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
