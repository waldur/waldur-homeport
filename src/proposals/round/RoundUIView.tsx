import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import {
  proposalProtectedCallsRetrieve,
  proposalProtectedCallsRoundsRetrieve,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem, PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';

import { Call } from '../types';

import { RoundPageHero } from './RoundPageHero';

const ProposalsList = lazyComponent(() =>
  import('./proposals/ProposalsList').then((module) => ({
    default: module.ProposalsList,
  })),
);
const RoundReviewersList = lazyComponent(() =>
  import('@waldur/proposals/round/reviewers/RoundReviewersList').then(
    (module) => ({ default: module.RoundReviewersList }),
  ),
);
const RoundSubmissionSection = lazyComponent(() =>
  import('./submission/RoundSubmissionSection').then((module) => ({
    default: module.RoundSubmissionSection,
  })),
);
const RoundReviewSection = lazyComponent(() =>
  import('./review/RoundReviewSection').then((module) => ({
    default: module.RoundReviewSection,
  })),
);
const RoundAllocationSection = lazyComponent(() =>
  import('./allocation/RoundAllocationSection').then((module) => ({
    default: module.RoundAllocationSection,
  })),
);

const tabs: PageBarTab[] = [
  {
    key: 'proposals',
    title: translate('Proposals'),
    component: ProposalsList,
  },
  {
    key: 'reviewers',
    title: translate('Reviewers'),
    component: RoundReviewersList,
  },
  {
    key: 'submission',
    title: translate('Submission strategy'),
    component: RoundSubmissionSection,
  },
  {
    key: 'review',
    title: translate('Review strategy'),
    component: RoundReviewSection,
  },
  {
    key: 'allocation',
    title: translate('Allocation strategy'),
    component: RoundAllocationSection,
  },
];

export const RoundUIView = () => {
  const {
    params: { call_uuid, round_uuid },
  } = useCurrentStateAndParams();

  const {
    data: round,
    isLoading: isLoadingRound,
    error: errorRound,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['CallRound', call_uuid, round_uuid],

    queryFn: () =>
      proposalProtectedCallsRoundsRetrieve({
        path: { uuid: call_uuid, obj_uuid: round_uuid },
      }).then((response) => response.data),

    refetchOnWindowFocus: false,
  });

  const {
    data: call,
    isLoading: isLoadingCall,
    error: errorCall,
  } = useQuery({
    queryKey: ['RoundCall', call_uuid],

    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data as any as Call,
      ),

    refetchOnWindowFocus: false,
  });

  useTitle(round ? round.name : translate('Call round'));

  const isLoading = isLoadingCall || isLoadingRound;
  const error = errorCall || errorRound;

  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    round && call ? <RoundPageHero call={call} round={round} /> : null,
    [round, call],
  );
  const { getOrganizationBreadcrumbItem } = usePresetBreadcrumbItems();
  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () =>
      !(round && call)
        ? []
        : [
            {
              key: 'organizations',
              text: translate('Organizations'),
              to: 'organizations',
            },
            getOrganizationBreadcrumbItem({
              uuid: call.customer_uuid,
              name: call.customer_name,
            }),
            {
              key: 'call-list',
              text: translate('Calls for proposals'),
              to: 'call-management.call-list',
              params: { uuid: call.customer_uuid },
              ellipsis: 'xl',
            },
            {
              key: 'call',
              text: call.name,
              to: 'protected-call.main',
              params: { call_uuid: call.uuid },
              ellipsis: 'xl',
            },
            {
              key: 'call-rounds',
              text: translate('Rounds'),
              to: 'protected-call.main',
              params: { call_uuid: call.uuid, tab: 'rounds' },
              ellipsis: 'md',
            },
            {
              key: 'round',
              text: round.name,
              truncate: true,
              active: true,
            },
          ],

    [round, call],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          round={round}
          call={call}
          isLoading={isLoading}
          isRefetching={isRefetching}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
