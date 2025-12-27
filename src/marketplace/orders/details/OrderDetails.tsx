import { FunctionComponent, useMemo } from 'react';
import { OrderDetails as OrderDetailsType } from 'waldur-js-client';

import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { PlanSection } from '@waldur/marketplace/details/plan/PlanSection';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem, PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';

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
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { UserSubmittedFieldsTab } from './UserSubmittedFieldsTab';

import '@waldur/core/CustomCard.scss';

const getOrderPageTabs = (data: {
  order: OrderDetailsType;
  offering: Offering;
}): PageBarTab[] => {
  const limitParser = getFormLimitParser(data.order.offering_type);
  const limits = limitParser(data.order.limits);
  const tabs = [
    {
      key: 'summary',
      title: translate('Order summary'),
      component: () => (
        <OrderSummaryTab order={data.order} offering={data.offering} />
      ),
    },
    {
      key: 'metadata',
      title: translate('Metadata'),
      component: () => (
        <OrderMetadataTab order={data.order} offering={data.offering} />
      ),
    },
    {
      key: 'user-submitted-fields',
      title: translate('User submitted fields'),
      component: () => <UserSubmittedFieldsTab order={data.order} />,
    },
    {
      key: 'accounting',
      title: translate('Accounting'),
      component: () => (
        <PlanSection offering={data.offering} order={data.order} />
      ),
    },
    {
      key: 'limits',
      title: translate('Limits'),
      component: () => (
        <LimitsSection components={data.offering.components} limits={limits} />
      ),
    },
  ];

  // Only show Output tab if there is output
  if (data.order.output) {
    tabs.push({
      key: 'output',
      title: translate('Output'),
      component: () => <OutputTab order={data.order} />,
    });
  }

  // Only show Error details tab if there are errors
  if (data.order.error_message) {
    tabs.push({
      key: 'error-details',
      title: translate('Error details'),
      component: () => <ErrorDetailsTab order={data.order} />,
    });
  }

  return tabs.filter(Boolean);
};

interface OrderDetailsProps {
  offering: any;
  order: any;
  data: any;
  refetch: any;
  isRefetching: boolean;
}

const PageHero = ({ data, isRefetching }) => (
  <PublicDashboardHero
    hideQuickSection
    cardBordered
    className="container-fluid my-5 d-print-none"
    logo={data.offering.thumbnail}
    logoAlt={data.offering.name}
    logoTooltip={data.offering.name}
    logoCircle
    title={<OrderDetailsHeaderTitle order={data.order} />}
    actions={
      <>
        <RefreshButton refetch={data.refetch} isLoading={isRefetching} />

        {data.order.attachment && data.order.state === 'pending-provider' ? (
          <OrderReviewButton order={data.order} loadData={data.refetch} />
        ) : (
          <OrderActionsButton
            order={data.order}
            offering={data.offering}
            loadData={data.refetch}
          />
        )}
      </>
    }
  >
    <OrderDetailsHeaderBody order={data.order} />
  </PublicDashboardHero>
);

export const OrderDetails: FunctionComponent<OrderDetailsProps> = (data) => {
  useTitle(translate('Order details'));
  usePageHero(<PageHero data={data} isRefetching={data.isRefetching} />, [
    data.isRefetching,
    data.offering,
    data.order,
    data.refetch,
  ]);

  const { getOrganizationBreadcrumbItem } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    const order = data.order;
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
  }, [data.order]);
  useBreadcrumbs(breadcrumbItems);

  const tabs = useMemo(() => getOrderPageTabs(data), []);
  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  if (data) {
    return (
      <>
        <Component />
        <OrderAccordion {...data} loadData={data.refetch} />
      </>
    );
  }
  return null;
};
