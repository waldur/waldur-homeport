import { FunctionComponent, useMemo } from 'react';

import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { PlanSection } from '@waldur/marketplace/details/plan/PlanSection';
import { getOrderBreadcrumbItems } from '@waldur/marketplace/utils';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import { OrderActionsButton } from '../actions/OrderActionsButton';

import { ErrorDetailsTab } from './ErrorDetailsTab';
import { LimitsSection } from './LimitsSection';
import { OrderAccordion } from './OrderAccordion';
import { OrderDetailsApprovalsTab } from './OrderDetailsApprovalsTab';
import { OrderDetailsHeaderBody } from './OrderDetailsHeaderBody';
import { OrderDetailsHeaderTitle } from './OrderDetailsHeaderTitle';
import { OrderDetailsQuickBody } from './OrderDetailsQuickBody';
import { OrderMetadataTab } from './OrderMetadataTab';
import { OutputTab } from './OutputTab';
import { UserSubmittedFieldsTab } from './UserSubmittedFieldsTab';

import '@waldur/core/CustomCard.scss';

const getOrderPageTabs = (data): PageBarTab[] => {
  const limitParser = getFormLimitParser(data.order.offering_type);
  const limits = limitParser(data.order.limits);
  return [
    {
      key: 'approvals',
      title: translate('Approvals'),
      component: () => (
        <OrderDetailsApprovalsTab order={data.order} offering={data.offering} />
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
      key: 'output',
      title: translate('Output'),
      component: () => <OutputTab order={data.order} />,
    },
    {
      key: 'error-details',
      title: translate('Error details'),
      component: () => <ErrorDetailsTab order={data.order} />,
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
};

interface OrderDetailsProps {
  offering: any;
  order: any;
  data: any;
  refetch: any;
  isRefetching: boolean;
}

const PageHero = ({ data, isRefetching }) => (
  <PublicDashboardHero2
    className="container-fluid mb-8 mt-6"
    logo={data.offering.thumbnail}
    logoAlt={data.offering.name}
    logoTooltip={data.offering.name}
    title={<OrderDetailsHeaderTitle order={data.order} />}
    quickBody={<OrderDetailsQuickBody order={data.order} />}
    quickActions={
      <div className="d-flex flex-column flex-wrap gap-2">
        <RefreshButton
          refetch={data.refetch}
          isLoading={isRefetching}
          size="sm"
        />
        <OrderActionsButton order={data.order} loadData={data.refetch} />
      </div>
    }
  >
    <OrderDetailsHeaderBody order={data.order} />
  </PublicDashboardHero2>
);

export const OrderDetails: FunctionComponent<OrderDetailsProps> = (data) => {
  useTitle(translate('Order details'));
  usePageHero(<PageHero data={data} isRefetching={data.isRefetching} />);
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
