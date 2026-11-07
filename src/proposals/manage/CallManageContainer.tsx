import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { useBreadcrumbs } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AccessDeniedPage } from '@/error/AccessDeniedPage';
import { InvalidRoutePage } from '@/error/InvalidRoutePage';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { LayoutSlot } from '@/navigation/slots';
import { useTitle } from '@/navigation/title';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { useValidationRedirect } from '@/proposals/validation/useValidationRedirect';
import { useUser } from '@/workspace/hooks';

import { CallTabs } from '../details/CallTabs';
import { CallReportsTab } from '../reports/CallReportsTab';
import { leaveReportParamsBehind, REPORTS_TAB } from '../reports/reportParams';
import { CallUpdateHero } from '../update/CallUpdateHero';
import { CallResourcePoolsSection } from '../update/resource-pools/CallResourcePoolsSection';
import { ReviewerPoolContainer } from '../update/reviewer-pool/ReviewerPoolContainer';
import {
  canAccessCallManagement,
  canReadCallReports,
  canUpdateCall,
  useCallBreadcrumbItems,
} from '../utils';

import { CallDashboard } from './CallDashboard';
import { CallEventsList } from './CallEventsList';
import { CallProposalsList } from './CallProposalsList';
import { CallReviewsList } from './CallReviewsList';

const PageHero = ({ call, refetch }) => (
  <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-[1.25rem]')}>
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch, loading }) => {
  const user = useUser();
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
          // What the call awards, against what it has requested and
          // awarded so far: watched and adjusted while the call runs.
          key: 'resource-pools',
          title: translate('Resource pools'),
          component: CallResourcePoolsSection,
        },
        // Only for those the report endpoint answers: this page is also
        // open to organization owners without CALL.UPDATE.
        !isFeatureVisible(MarketplaceFeatures.call_only) &&
          canReadCallReports(user, call) && {
            key: REPORTS_TAB,
            title: translate('Reports'),
            component: CallReportsTab,
          },
        {
          key: 'events',
          title: translate('Events'),
          component: CallEventsList,
        },
      ].filter(Boolean) as PageBarTab[],
    [call, user],
  );
  // Leaving Reports leaves its report and filters behind.
  const linkedTabs = useMemo(() => leaveReportParamsBehind(tabs), [tabs]);

  const breadcrumbItems = useCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(linkedTabs);
  useValidationRedirect();

  // The same gate as the Edit page: an archived call is frozen, and every
  // write needs UPDATE_CALL.
  const isReadOnly = call.state === 'archived' || !canUpdateCall(user, call);

  return (
    <>
      <LayoutSlot name="hero">
        <PageHero call={call} refetch={refetch} />
      </LayoutSlot>
      <Component
        call={call}
        refetch={refetch}
        loading={loading}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

export const CallManageContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();
  const user = useUser();

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
        (r) => r.data,
      ),
    refetchOnWindowFocus: false,
  });

  useTitle(call ? call.name : translate('Call management'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    // Same gate as the Edit page: this URL is reachable by anyone who can read
    // the call, and reviewers and panel members can.
    canAccessCallManagement(user, call) ? (
      <Body refetch={refetch} loading={isRefetching} call={call} />
    ) : (
      <AccessDeniedPage />
    )
  ) : (
    <InvalidRoutePage />
  );
};
