import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';

import { CallTabs } from '../details/CallTabs';
import { Call } from '../types';
import { CallUpdateHero } from '../update/CallUpdateHero';
import { ReviewerPoolContainer } from '../update/reviewer-pool/ReviewerPoolContainer';
import { useCallBreadcrumbItems } from '../utils';

import { CallDashboard } from './CallDashboard';
import { CallEventsList } from './CallEventsList';
import { CallProposalsList } from './CallProposalsList';
import { CallReviewsList } from './CallReviewsList';

const PageHero = ({ call, refetch }) => (
  <div className="container-fluid my-5">
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch, loading }) => {
  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'dashboard',
          title: translate('Dashboard'),
          component: CallDashboard,
        },
        !isFeatureVisible(MarketplaceFeatures.call_only) && {
          key: 'proposals',
          title: translate('Proposals'),
          component: CallProposalsList,
        },
        !isFeatureVisible(MarketplaceFeatures.call_only) && {
          key: 'reviews',
          title: translate('Reviews'),
          component: CallReviewsList,
        },
        !isFeatureVisible(MarketplaceFeatures.call_only) && {
          key: 'reviewer-pool',
          title: translate('Reviewer pool'),
          component: ReviewerPoolContainer,
        },
        {
          key: 'events',
          title: translate('Events'),
          component: CallEventsList,
        },
      ].filter(Boolean) as PageBarTab[],
    [call],
  );

  usePageHero(<PageHero call={call} refetch={refetch} />);

  const breadcrumbItems = useCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  return <Component call={call} refetch={refetch} loading={loading} />;
};

export const CallManageContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const {
    data: call,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['CallManageContainer', call_uuid],
    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data as any as Call,
      ),
    refetchOnWindowFocus: false,
  });

  useTitle(call ? call.name : translate('Call management'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    <Body refetch={refetch} loading={isRefetching} call={call} />
  ) : (
    <InvalidRoutePage />
  );
};
