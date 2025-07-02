import {
  ArrowsClockwiseIcon,
  InfoIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersCreate, Resource } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProgressSteps } from '@waldur/core/ProgressSteps';
import { omit } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const ResourceOrderErrorDialog = lazyComponent(() =>
  import('./ResourceOrderErrorDialog').then((module) => ({
    default: module.ResourceOrderErrorDialog,
  })),
);

interface OrderErredViewProps {
  resource: Resource;
}

const ShowErrorButton = ({ resource }) => {
  const dispatch = useDispatch();
  const showErrorDialog = () => {
    dispatch(
      openModalDialog(ResourceOrderErrorDialog, {
        resolve: { resource },
        size: 'lg',
      }),
    );
  };
  return (
    <Button variant="light-danger" size="sm" onClick={showErrorDialog}>
      <span className="svg-icon svg-icon-4">
        <XCircleIcon weight="bold" />
      </span>
      {translate('Show error')}
    </Button>
  );
};

const getSortedSteps = (resource: Resource) => [
  {
    label: translate('Order submitted'),
    description: [
      [
        resource.creation_order.created_by_full_name,
        formatDateTime(resource.creation_order.created),
      ].join(', '),
    ],

    state: [],
  },
  {
    label: translate('Approved'),
    description: [
      [
        resource.creation_order.consumer_reviewed_by_full_name,
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
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      await waitForConfirmation(
        dispatch,
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
            attributes: resource.attributes,
            limits: resource.limits,
          },
        });
        dispatch(showSuccess(translate('Order has been submitted.')));
        router.stateService.go('marketplace-resource-details', {
          resource_uuid: order.data.marketplace_resource_uuid,
        });
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to submit order.')),
        );
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
            <Button
              variant="outline btn-outline-default"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
            >
              <span className="svg-icon svg-icon-4">
                <ArrowsClockwiseIcon
                  weight="bold"
                  className={isLoading ? ' animation-spin' : ''}
                />
              </span>
              {translate('Retry')}
            </Button>
            <OrderDetailsLink
              order_uuid={resource.creation_order.uuid}
              project_uuid={resource.creation_order.project_uuid}
              className="btn btn-sm btn-outline btn-outline-default"
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
