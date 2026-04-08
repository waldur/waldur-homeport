import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { PlanSection } from '@waldur/marketplace/details/plan/PlanSection';
import { OrderErredView } from '@waldur/marketplace/resources/resource-pending/OrderErredView';
import { OrderInProgressView } from '@waldur/marketplace/resources/resource-pending/OrderInProgressView';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem, PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { RootState } from '@waldur/store/reducers';
import {
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { OrderActionsButton } from '../actions/OrderActionsButton';

import { ErrorDetailsTab } from './ErrorDetailsTab';
import { LimitsSection } from './LimitsSection';
import { OrderAccordion } from './OrderAccordion';
import { OrderBreadcrumbPopover } from './OrderBreadcrumbPopover';
import { OrderDetailsHeaderBody } from './OrderDetailsHeaderBody';
import { OrderDetailsHeaderTitle } from './OrderDetailsHeaderTitle';
import { OrderMetadataTab } from './OrderMetadataTab';
import { OrderReviewButton } from './OrderReviewButton';
import { OrderSummaryTab } from './OrderSummaryTab';
import { OutputTab } from './OutputTab';
import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProviderConsumerInfoTab } from './ProviderConsumerInfoTab';
import { RejectionDetailsTab } from './RejectionDetailsTab';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceRenewal } from './type-based/ResourceRenewal';
import { UserSubmittedFieldsTab } from './UserSubmittedFieldsTab';

import '@waldur/core/CustomCard.scss';

const getOrderPageTabs = (props: OrderDetailsProps): PageBarTab[] => {
  const tabs = [
    {
      key: 'summary',
      title: translate('Summary'),
      component: () => (
        <OrderSummaryTab order={props.order} offering={props.offering} />
      ),
    },
    {
      key: 'metadata',
      title: translate('Metadata'),
      component: () => (
        <OrderMetadataTab order={props.order} offering={props.offering} />
      ),
    },
    {
      key: 'user-submitted-fields',
      title: translate('User submitted fields'),
      component: () => <UserSubmittedFieldsTab order={props.order} />,
    },
    {
      key: 'accounting',
      title: translate('Accounting'),
      component: () => {
        const isRenewal =
          props.order.type === 'Update' &&
          (props.order.attributes as any)?.action === 'renew';
        return isRenewal ? (
          <div className="d-flex flex-column gap-3">
            <ResourceRenewal order={props.order} offering={props.offering} />
          </div>
        ) : (
          <PlanSection offering={props.offering} order={props.order} />
        );
      },
    },
    {
      key: 'limits',
      title: translate('Limits'),
      component: () => {
        const limitParser = getFormLimitParser(props.order.offering_type);
        const limits = limitParser(props.order.limits);
        return (
          <LimitsSection
            components={props.offering.components}
            limits={limits}
            order={props.order}
            offering={props.offering}
          />
        );
      },
    },
  ];

  // Only show Provider info tab when provider has sent a message or attachment
  if (props.order.provider_message || props.order.provider_message_attachment) {
    tabs.push({
      key: 'provider-info',
      title: translate('Provider info'),
      component: () => (
        <ProviderConsumerInfoTab
          order={props.order}
          offering={props.offering}
          refetch={props.refetch}
        />
      ),
    });
  }

  // Only show Output tab if there is output
  if (props.order.output) {
    tabs.push({
      key: 'output',
      title: translate('Output'),
      component: () => <OutputTab order={props.order} />,
    });
  }

  // Only show Error details tab if there are errors
  if (props.order.error_message) {
    tabs.push({
      key: 'error-details',
      title: translate('Error details'),
      component: () => <ErrorDetailsTab order={props.order} />,
    });
  }

  // Only show Rejection details tab if there are rejection comments
  if (
    props.order.consumer_rejection_comment ||
    props.order.provider_rejection_comment
  ) {
    tabs.push({
      key: 'rejection-details',
      title: translate('Rejection details'),
      component: () => <RejectionDetailsTab order={props.order} />,
    });
  }

  return tabs.filter(Boolean);
};

interface OrderDetailsProps {
  offering: any;
  order: any;
  resource: Resource;
  limits: any;
  refetch: any;
  isRefetching: boolean;
}

const PageHero = ({ isRefetching, ...props }: OrderDetailsProps) => {
  const isCustomer = useSelector(
    (state: RootState) =>
      !(isServiceManagerSelector(state) || isOwnerOrStaff(state)),
  );
  return (
    <>
      {isCustomer ? (
        // Show only for customers
        props.resource.order_in_progress ? (
          <OrderInProgressView
            customerView
            resource={props.resource}
            offering={props.offering}
            refetch={props.refetch}
          />
        ) : props.resource.creation_order ? (
          <OrderErredView resource={props.resource} />
        ) : null
      ) : null}

      <PublicDashboardHero
        hideQuickSection
        cardBordered
        className="container-fluid my-5 d-print-none"
        logo={props.offering.thumbnail}
        logoAlt={props.offering.name}
        logoTooltip={props.offering.name}
        logoCircle
        title={<OrderDetailsHeaderTitle order={props.order} />}
        actions={
          <>
            <RefreshButton refetch={props.refetch} isLoading={isRefetching} />

            {props.order.attachment &&
            props.order.state === 'pending-provider' ? (
              <OrderReviewButton order={props.order} loadData={props.refetch} />
            ) : (
              <OrderActionsButton
                order={props.order}
                offering={props.offering}
                loadData={props.refetch}
              />
            )}
          </>
        }
      >
        <OrderDetailsHeaderBody order={props.order} offering={props.offering} />
      </PublicDashboardHero>
    </>
  );
};

export const OrderDetails: FunctionComponent<OrderDetailsProps> = (props) => {
  useTitle(translate('Order details'));
  usePageHero(<PageHero {...props} isRefetching={props.isRefetching} />, [
    props.isRefetching,
    props.offering,
    props.order,
    props.resource,
    props.refetch,
  ]);

  const { getOrganizationBreadcrumbItem } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    const order = props.order;
    if (!order) return [];
    return [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
        ellipsis: 'xxl',
      },
      getOrganizationBreadcrumbItem({
        uuid: order.customer_uuid,
        name: order.customer_name,
      }),
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: order.customer_uuid },
        ellipsis: 'xxl',
      },
      {
        key: 'project.dashboard',
        text: order.project_name,
        to: 'project.dashboard',
        params: { uuid: order.project_uuid },
        dropdown: (close) => (
          <ProjectBreadcrumbPopover order={order} close={close} />
        ),
        ellipsis: 'xl',
        truncate: true,
      },
      {
        key: 'project.resources',
        text: order.category_title,
        to: 'project.resources',
        params: { uuid: order.project_uuid },
        ellipsis: 'xxl',
      },
      {
        key: 'resource',
        text: order.resource_name,
        to: 'marketplace-resource-details',
        params: { resource_uuid: order.marketplace_resource_uuid },
        dropdown: (close) => (
          <ResourceBreadcrumbPopover order={order} close={close} />
        ),
        truncate: true,
        tooltipText: `${order.category_title}: ${order.resource_name}`,
      },
      {
        key: 'order',
        text:
          (order.attributes?.name || translate('Order')) +
          ' (' +
          order.type +
          ')',
        dropdown: (close) => (
          <OrderBreadcrumbPopover order={order} close={close} />
        ),
        active: true,
        truncate: true,
      },
    ];
  }, [props.order]);
  useBreadcrumbs(breadcrumbItems);

  const tabs = useMemo(
    () => getOrderPageTabs(props),
    [props.order, props.offering, props.limits],
  );
  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  if (props) {
    return (
      <>
        <Component />
        <OrderAccordion {...props} loadData={props.refetch} />
      </>
    );
  }
  return null;
};
