import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import { getProtectedCall, getProtectedCallRound } from '../api';

import { RoundBreadcrumbs } from './RoundBreadcrumbs';
import { RoundPageHero } from './RoundPageHero';

const ProposalsList = lazyComponent(
  () => import('./proposals/ProposalsList'),
  'ProposalsList',
);
const RoundReviewersList = lazyComponent(
  () => import('@waldur/proposals/round/reviewers/RoundReviewersList'),
  'RoundReviewersList',
);
const RoundSubmissionSection = lazyComponent(
  () => import('./submission/RoundSubmissionSection'),
  'RoundSubmissionSection',
);
const RoundReviewSection = lazyComponent(
  () => import('./review/RoundReviewSection'),
  'RoundReviewSection',
);
const RoundAllocationSection = lazyComponent(
  () => import('./allocation/RoundAllocationSection'),
  'RoundAllocationSection',
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
  } = useQuery(
    ['CallRound', call_uuid, round_uuid],
    () => getProtectedCallRound(call_uuid, round_uuid),
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: call,
    isLoading: isLoadingCall,
    error: errorCall,
  } = useQuery(['RoundCall', call_uuid], () => getProtectedCall(call_uuid), {
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

  useBreadcrumbs(
    round && call ? <RoundBreadcrumbs round={round} call={call} /> : null,
    [round, call],
  );

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          {...props}
          key={key}
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
