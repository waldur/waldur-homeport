import { FunctionComponent, useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { OrderDetails as OrderDetailsType } from 'waldur-js-client';

import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { PlanSection } from '@waldur/marketplace/details/plan/PlanSection';
import { Offering } from '@waldur/marketplace/types';
import { getOrderBreadcrumbItems } from '@waldur/marketplace/utils';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';

import { OrderActionsButton } from '../actions/OrderActionsButton';

import { ErrorDetailsTab } from './ErrorDetailsTab';
import { LimitsSection } from './LimitsSection';
import { OrderAccordion } from './OrderAccordion';
import { OrderDetailsHeaderBody } from './OrderDetailsHeaderBody';
import { OrderDetailsHeaderTitle } from './OrderDetailsHeaderTitle';
import { OrderDetailsQuickBody } from './OrderDetailsQuickBody';
import { OrderMetadataTab } from './OrderMetadataTab';
import { OrderReviewButton } from './OrderReviewButton';
import { OrderSummaryTab } from './OrderSummaryTab';
import { OutputTab } from './OutputTab';
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
    title={
      <Stack direction="horizontal">
        <Stack direction="vertical">
          <OrderDetailsHeaderTitle order={data.order} />
          <OrderDetailsQuickBody order={data.order} />
          <OrderDetailsHeaderBody order={data.order} />
        </Stack>
        {data.order.attachment && data.order.state === 'pending-provider' ? (
          <Stack gap={3} className="align-items-end d-flex">
            <RefreshButton
              refetch={data.refetch}
              isLoading={isRefetching}
              size="sm"
            />
            <OrderReviewButton order={data.order} loadData={data.refetch} />
          </Stack>
        ) : (
          <Stack
            direction="vertical"
            gap={3}
            className="align-items-end d-flex"
          >
            <RefreshButton
              refetch={data.refetch}
              isLoading={isRefetching}
              size="sm"
            />

            <OrderActionsButton
              order={data.order}
              offering={data.offering}
              loadData={data.refetch}
            />
          </Stack>
        )}
      </Stack>
    }
  />
);

export const OrderDetails: FunctionComponent<OrderDetailsProps> = (data) => {
  useTitle(translate('Order details'));
  usePageHero(<PageHero data={data} isRefetching={data.isRefetching} />, [
    data.isRefetching,
    data.offering,
    data.order,
    data.refetch,
  ]);
  const breadcrumbItems = useMemo(
    () => getOrderBreadcrumbItems(data.order),
    [data.order],
  );
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
