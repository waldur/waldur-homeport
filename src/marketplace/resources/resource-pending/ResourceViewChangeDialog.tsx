import { FC } from 'react';
import { Offering, Resource } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { OrderConsumerActions } from '@waldur/marketplace/orders/actions/OrderConsumerActions';
import { OrderProviderActions } from '@waldur/marketplace/orders/actions/OrderProviderActions';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Field } from '@waldur/resource/summary';
import { ActionButton } from '@waldur/table/ActionButton';

import { ResourceLimitChangeInfo } from './ResourceLimitChangeInfo';
import { ResourcePlanChangeInfo } from './ResourcePlanChangeInfo';
import {
  hasResourceChangePlanRequest,
  hasResourceLimitChangeRequest,
} from './utils';

interface ResourceViewChangeDialogProps {
  resolve: { resource: Resource; offering: Offering; refetch(): void };
}

export const ResourceViewChangeDialog: FC<ResourceViewChangeDialogProps> = ({
  resolve: { resource, offering, refetch },
}) => {
  const order = resource.order_in_progress;
  const hasChangePlanRequest = hasResourceChangePlanRequest(resource);
  const hasLimitChangeRequest = hasResourceLimitChangeRequest(resource);

  return (
    <ModalDialog
      title={
        hasChangePlanRequest && hasLimitChangeRequest
          ? translate('Plan & limit change request')
          : hasLimitChangeRequest
            ? translate('Resource limit change request')
            : translate('Plan change request')
      }
      footer={
        <>
          <OrderDetailsLink
            order_uuid={order.uuid}
            project_uuid={order.project_uuid}
            className="btn btn-tertiary"
          >
            {translate('Go to order')}
          </OrderDetailsLink>
          {order.state === 'pending-consumer' ? (
            <div className="d-flex flex-row-reverse gap-4">
              <OrderConsumerActions
                order={order}
                refetch={refetch}
                as={ActionButton}
              />
            </div>
          ) : order.state === 'pending-provider' ? (
            <div className="d-flex flex-row-reverse gap-4">
              <OrderProviderActions
                order={order}
                refetch={refetch}
                as={ActionButton}
              />
            </div>
          ) : null}
        </>
      }
    >
      <Field label={translate('Order UUID')} value={order.uuid} space={2} />

      {hasChangePlanRequest && <ResourcePlanChangeInfo resource={resource} />}
      {hasChangePlanRequest && hasLimitChangeRequest && <hr />}
      {hasLimitChangeRequest && (
        <ResourceLimitChangeInfo resource={resource} offering={offering} />
      )}
    </ModalDialog>
  );
};
