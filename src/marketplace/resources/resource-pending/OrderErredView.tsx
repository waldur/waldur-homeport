import {
  ArrowsClockwiseIcon,
  InfoIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceOrdersCreate,
  OrderCreateRequest,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { ProgressSteps } from '@/core/ProgressSteps';
import { omit } from '@/core/utils';
import { translate } from '@/i18n';
import { OrderDetailsLink } from '@/marketplace/orders/details/OrderDetailsLink';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { CompactActionButton } from '@/table/CompactActionButton';
import { useUser } from '@/workspace/hooks';

const ResourceOrderErrorDialog = lazyComponent(() =>
  import('./ResourceOrderErrorDialog').then((module) => ({
    default: module.ResourceOrderErrorDialog,
  })),
);

interface OrderErredViewProps {
  resource: Resource;
}

const ShowErrorButton = ({ resource }) => {
  const { openDialog } = useModal();
  const showErrorDialog = () => {
    openDialog(ResourceOrderErrorDialog, {
      resolve: { resource },
      size: 'lg',
    });
  };
  return (
    <CompactActionButton
      variant="danger"
      action={showErrorDialog}
      iconNode={<XCircleIcon weight="bold" />}
      title={translate('Show error')}
    />
  );
};

const getSortedSteps = (resource: Resource) => [
  {
    label: translate('Order submitted'),
    description: [
      [
        resource.creation_order.created_by_full_name ||
          resource.creation_order.created_by_username,
        formatDateTime(resource.creation_order.created),
      ].join(', '),
    ],

    state: [],
  },
  {
    label: translate('Approved'),
    description: [
      [
        resource.creation_order.consumer_reviewed_by_full_name ||
          resource.creation_order.consumer_reviewed_by_username,
        formatDateTime(resource.creation_order.consumer_reviewed_at),
      ].join(', '),
    ],

    state: [],
  },
  {
    label: translate('Creation has failed'),
    description: [
      [
        translate('System'),
        formatDateTime(resource.creation_order.modified),
      ].join(', '),
    ],

    state: ['erred'],
    variant: 'danger',
  },
];

const getSteps = (resource: Resource) => {
  const steps: Array<{ label; description?; completed; color?; icon? }> = [];
  const sortedSteps = getSortedSteps(resource);
  const currentStateIndex =
    sortedSteps.findIndex((step) =>
      step.state.includes(resource.creation_order.state),
    ) - 1;
  sortedSteps.forEach((step, i) => {
    steps.push({
      ...omit(step, 'state'),
      completed: i <= currentStateIndex,
    });
  });
  return steps;
};

export const OrderErredView: FC<OrderErredViewProps> = ({ resource }) => {
  const { confirm } = useModal();

  const { showErrorResponse, showSuccess } = useNotify();

  const router = useRouter();
  const user = useUser();
  const canCreateOrder = hasPermission(user, {
    permission: PermissionEnum.CREATE_ORDER,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      await confirm(
        translate('Confirmation'),
        translate(
          'Are you sure you want to retry to submit this order? This will create a new resource, it will not remove current one.',
        ),
      );
      try {
        const order = await marketplaceOrdersCreate({
          body: {
            offering: resource.offering,
            project: resource.project,
            plan: resource.plan,
            attributes: resource.attributes as OrderCreateRequest['attributes'],
            limits: resource.limits,
          },
        });
        showSuccess(translate('Order has been submitted.'));
        router.stateService.go('marketplace-resource-details', {
          resource_uuid: order.data.marketplace_resource_uuid,
        });
      } catch (error) {
        showErrorResponse(error, translate('Unable to submit order.'));
      }
    },
  });

  if (
    !resource.creation_order ||
    resource.state === 'OK' ||
    resource.creation_order.state !== 'erred'
  ) {
    return null;
  }
  const steps = getSteps(resource);
  return (
    <div className="container-fluid mt-6">
      <Card className="card-bordered overflow-hidden">
        <Card.Body className="d-flex flex-column flex-sm-row align-items-center gap-4">
          <ProgressSteps
            steps={steps}
            bgClass="bg-body"
            className="flex-grow-1"
          />

          <div className="d-flex flex-sm-column gap-3 text-nowrap">
            {canCreateOrder && (
              <CompactActionButton
                variant="tertiary"
                action={mutate}
                pending={isLoading}
                iconNode={<ArrowsClockwiseIcon weight="bold" />}
                title={translate('Retry')}
              />
            )}
            <OrderDetailsLink
              order_uuid={resource.creation_order.uuid}
              project_uuid={resource.creation_order.project_uuid}
              className="btn btn-sm btn-tertiary"
            >
              <span className="svg-icon svg-icon-4">
                <InfoIcon weight="bold" />
              </span>
              {translate('View order')}
            </OrderDetailsLink>
            <ShowErrorButton resource={resource} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
