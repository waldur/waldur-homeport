import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@/support/constants';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { MarkAsDoneButton } from './MarkAsDoneButton';
import { OrderConsumerActions } from './OrderConsumerActions';
import { OrderProviderActions } from './OrderProviderActions';
import { RetryOrderButton } from './RetryOrderButton';
import { SetAsErredButton } from './SetAsErredButton';

export const OrderActionsButton = ({
  order,
  offering,
  loadData,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
  loadData;
}) => {
  const user = useUser();

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

  const showSetAsErredButton = useMemo(() => {
    if (hideProviderActions) {
      return false;
    }
    return (
      order.state === 'executing' &&
      order.offering_type === SITE_AGENT_PLUGIN &&
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: order.provider_uuid,
      })
    );
  }, [order, user, hideProviderActions]);

  const showRetryButton = useMemo(() => {
    if (order.state !== 'erred') return false;
    if (![BASIC_OFFERING_TYPE, SITE_AGENT_PLUGIN].includes(order.offering_type))
      return false;
    return hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: order.provider_uuid,
    });
  }, [order, user]);

  const showConsumerActions = useMemo(() => {
    if (order.state !== 'pending-consumer') return false;
    const canApprove = hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    });
    const canReject = hasPermission(user, {
      permission: PermissionEnum.REJECT_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    });
    return canApprove || canReject;
  }, [order, user]);

  if (order.state === 'pending-provider' && !hideProviderActions) {
    return (
      <OrderProviderActions
        order={order}
        offering={offering}
        refetch={loadData}
        labeledDropdown
      />
    );
  }

  return showCancelButton ||
    showMarkAsDoneButton ||
    showSetAsErredButton ||
    showConsumerActions ||
    showRetryButton ? (
    <ActionsDropdownComponent
      label={translate('Actions')}
      labeled
      size="lg"
      drop="down"
    >
      {showRetryButton && <RetryOrderButton row={order} refetch={loadData} />}
      {showMarkAsDoneButton && (
        <MarkAsDoneButton row={order} refetch={loadData} />
      )}
      {showSetAsErredButton && (
        <SetAsErredButton row={order} refetch={loadData} />
      )}
      {showCancelButton && (
        <CancelOrderButton uuid={order.uuid} loadData={loadData} />
      )}
      {showConsumerActions && (
        <OrderConsumerActions order={order} offering={offering} />
      )}
    </ActionsDropdownComponent>
  ) : null;
};
