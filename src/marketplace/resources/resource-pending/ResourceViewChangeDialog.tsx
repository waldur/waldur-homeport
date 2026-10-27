import { FC } from 'react';
import { Offering, Resource } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { OrderConsumerActions } from '@/marketplace/orders/actions/OrderConsumerActions';
import { OrderProviderActions } from '@/marketplace/orders/actions/OrderProviderActions';
import { OrderDetailsLink } from '@/marketplace/orders/details/OrderDetailsLink';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { Field } from '@/resource/summary';

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
      subtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
      footer={
        <>
          <OrderDetailsLink
            order_uuid={order.uuid}
            project_uuid={order.project_uuid}
            buttonVariant="tertiary"
          >
            {translate('Go to order')}
          </OrderDetailsLink>
          {order.state === 'pending-consumer' ? (
            <div className="flex flex-row-reverse gap-3">
              <OrderConsumerActions
                order={order}
                offering={offering}
                refetch={refetch}
                as={BaseButton}
              />
            </div>
          ) : order.state === 'pending-provider' ? (
            <div className="flex flex-row-reverse gap-3">
              <OrderProviderActions
                order={order}
                refetch={refetch}
                as={BaseButton}
              />
            </div>
          ) : null}
        </>
      }
    >
      <Field label={translate('Order UUID')} value={order.uuid} space={1.5} />

      {hasChangePlanRequest && <ResourcePlanChangeInfo resource={resource} />}
      {hasChangePlanRequest && hasLimitChangeRequest && <hr />}
      {hasLimitChangeRequest && (
        <ResourceLimitChangeInfo resource={resource} offering={offering} />
      )}
    </ModalDialog>
  );
};
