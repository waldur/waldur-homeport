import { InfoIcon, WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { PublicOfferingDetails, Resource } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { OrderConsumerActions } from '@/marketplace/orders/actions/OrderConsumerActions';
import { OrderProviderActions } from '@/marketplace/orders/actions/OrderProviderActions';
import { OrderDetailsLink } from '@/marketplace/orders/details/OrderDetailsLink';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { ProgressSteps } from '@/wizard';

import { ResourceViewChangeButton } from './ResourceViewChangeButton';
import {
  hasResourceChangePlanRequest,
  hasResourceLimitChangeRequest,
} from './utils';

const OrderInProgressActions: FC<{
  resource: Resource;
  offering: PublicOfferingDetails;
  refetch(): void;
}> = ({ resource, offering, refetch }) => {
  if (resource.order_in_progress.state === 'pending-consumer') {
    return (
      <ActionsDropdownComponent labeled size="sm" drop="down">
        <OrderConsumerActions
          order={resource.order_in_progress}
          offering={offering}
          refetch={refetch}
        />
      </ActionsDropdownComponent>
    );
  }
  if (
    resource.order_in_progress.state === 'pending-provider' &&
    !(
      resource.offering_type === SITE_AGENT_PLUGIN &&
      !offering.plugin_options
        ?.enable_display_of_order_actions_for_service_provider
    )
  ) {
    return (
      <OrderProviderActions
        order={resource.order_in_progress}
        offering={offering}
        refetch={refetch}
        labeledDropdown
        size="sm"
      />
    );
  }
  return null;
};

interface OrderInProgressViewProps {
  resource: Resource;
  offering: PublicOfferingDetails;
  customerView?: boolean;
  refetch(): void;
}

const getTranslatedOrderType = (type) =>
  type === 'Create'
    ? translate('Creation')
    : type === 'Terminate'
      ? translate('Termination')
      : translate('Change');

export const getSteps = (
  resource: Resource,
  offering?: PublicOfferingDetails,
) => {
  const order = resource.order_in_progress;
  const steps: Array<{ label; description?; completed; variant? }> = [];
  steps.push({
    label: translate('Order created'),
    description: [
      [
        resource.order_in_progress.created_by_full_name,
        formatDateTime(resource.order_in_progress.created),
      ].join(', '),
    ],
    completed: true,
  });

  const isStep2Completed = order.state !== 'pending-consumer';
  const purchaseOrderNeeded =
    !isStep2Completed &&
    offering?.plugin_options?.require_purchase_order_upload &&
    !order.attachment;
  const step2Description: any[] = [];
  if (isStep2Completed) {
    step2Description.push(
      [
        order.consumer_reviewed_by_full_name,
        formatDateTime(order.consumer_reviewed_at),
      ].join(', '),
    );
  } else {
    step2Description.push(translate('Pending organization approval'));
    if (purchaseOrderNeeded) {
      step2Description.push(
        <Badge
          variant="warning"
          size="sm"
          leftIcon={<WarningIcon weight="bold" />}
          outline
        >
          {translate('Purchase order required')}
        </Badge>,
      );
    }
  }
  steps.push({
    label: isStep2Completed
      ? translate('Approved')
      : translate('Pending approval'),
    description: step2Description,
    completed: isStep2Completed,
    ...(purchaseOrderNeeded && { variant: 'warning' as const }),
  });

  const isStep3Completed = !['pending-consumer', 'pending-provider'].includes(
    order.state,
  );
  steps.push({
    label: isStep3Completed
      ? translate('Approved')
      : translate('Pending approval'),
    description: isStep3Completed
      ? [
          order.provider_reviewed_at
            ? [
                order.provider_reviewed_by_full_name ||
                  translate('By provider'),
                formatDateTime(order.provider_reviewed_at),
              ].join(', ')
            : translate('Auto-approved'),
        ]
      : [translate('Pending provider approval')],
    completed: isStep3Completed,
  });

  if (order.state === 'pending-project') {
    // The order is held until the project itself starts. The order's own start
    // date is validated to be no earlier than the project start date, so when it
    // is set it is the effective provisioning date; otherwise only the project
    // start date gates it, and that date is not exposed on the resource.
    steps.push({
      label: translate('Pending project start'),
      description: [
        order.start_date
          ? `${translate('Scheduled to start on')}: ${formatDate(
              order.start_date,
            )}`
          : translate('Waiting for the project to start'),
      ],
      completed: false, // This is the current, active step
    });
  } else if (order.state === 'pending-start-date') {
    steps.push({
      label: translate('Scheduled'),
      description: [
        `${translate('Scheduled to start on')}: ${formatDate(
          resource.creation_order.start_date,
        )}`,
      ],
      completed: false, // This is the current, active step
    });
  }

  steps.push({
    label: getTranslatedOrderType(order.type),
    description: [
      translate('Resource {type} process', {
        type: getTranslatedOrderType(
          resource.order_in_progress.type,
        ).toLowerCase(),
      }),
    ],
    // This logic correctly checks if the *previous* step is completed.
    // If the 'Scheduled' step was added, its 'completed' is false, so this step will correctly be marked as not completed.
    completed:
      steps[steps.length - 1].completed &&
      order.state !== 'executing' &&
      order.state !== 'pending-start-date',
  });

  const isStep4Completed =
    steps[steps.length - 1].completed &&
    ['done', 'canceled', 'erred', 'rejected'].includes(order.state);
  // Only an actually failed order may paint this step red. Every other state is
  // either successful or still in progress, and must keep the neutral variant.
  const isStep4Failed = ['canceled', 'erred', 'rejected'].includes(order.state);
  steps.push({
    label: translate('Completed'),
    description: isStep4Completed
      ? [
          order.state === 'canceled'
            ? translate('Canceled')
            : order.state === 'erred'
              ? translate('Erred')
              : order.state === 'rejected'
                ? translate('Rejected')
                : translate('Done'),
        ]
      : [
          order.type === 'Create'
            ? translate('Resource successfully created')
            : order.type === 'Terminate'
              ? translate('Resource successfully terminated')
              : translate('Resource successfully updated'),
        ],
    completed: isStep4Completed,
    variant: isStep4Failed ? 'danger' : 'primary',
  });
  return steps;
};

export const OrderInProgressView: FC<OrderInProgressViewProps> = ({
  resource,
  offering,
  customerView,
  refetch,
}) => {
  if (!resource.order_in_progress) {
    return null;
  }
  const steps = getSteps(resource, offering);
  const hasChangePlanRequest = hasResourceChangePlanRequest(resource);
  const hasLimitChangeRequest = hasResourceLimitChangeRequest(resource);
  return (
    <div className="container-fluid mt-6">
      <Card className="card-bordered border-gray-300 border-dashed border-1 overflow-hidden">
        <Card.Body className="d-flex flex-column flex-sm-row align-items-center gap-4">
          <ProgressSteps
            steps={steps}
            bgClass="bg-body"
            className="flex-grow-1"
          />

          <div className="d-flex flex-sm-column gap-3 text-nowrap">
            {!customerView &&
              (hasChangePlanRequest || hasLimitChangeRequest ? (
                <ResourceViewChangeButton
                  resource={resource}
                  offering={offering}
                  refetch={refetch}
                />
              ) : (
                <OrderDetailsLink
                  order_uuid={resource.order_in_progress.uuid}
                  project_uuid={resource.order_in_progress.project_uuid}
                  className="btn btn-sm btn-tertiary"
                >
                  <span className="svg-icon svg-icon-2">
                    <InfoIcon weight="bold" />
                  </span>
                  {translate('View order')}
                </OrderDetailsLink>
              ))}
            <OrderInProgressActions
              resource={resource}
              offering={offering}
              refetch={refetch}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
