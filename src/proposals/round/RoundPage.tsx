import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { RoundReviewersList } from '@waldur/proposals/round/reviewers/RoundReviewersList';

import { getProtectedCall, getProtectedCallRound } from '../api';

import { RoundAllocationSection } from './allocation/RoundAllocationSection';
import { ProposalsList } from './proposals/ProposalsList';
import { RoundReviewSection } from './review/RoundReviewSection';
import { RoundPageBar } from './RoundPageBar';
import { RoundPageHero } from './RoundPageHero';
import { RoundSubmissionSection } from './submission/RoundSubmissionSection';

export const RoundPage: FunctionComponent = () => {
  useFullPage();

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
    ['CallRoundPage', call_uuid, round_uuid],
    () => getProtectedCallRound(call_uuid, round_uuid),
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: call,
    isLoading: isLoadingCall,
    error: errorCall,
  } = useQuery(
    ['CallUpdateContainer', call_uuid],
    () => getProtectedCall(call_uuid),
    {
      refetchOnWindowFocus: false,
    },
  );

  useTitle(round ? round.name : translate('Call round'));

  const isLoading = isLoadingCall || isLoadingRound;
  const error = errorCall || errorRound;

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call round.')}</h3>
  ) : round && call ? (
    <PageBarProvider>
      <div className="m-b">
        <RoundPageHero round={round} call={call} />
        <RoundPageBar />
        <div className="container-xxl py-10">
          <ProposalsList round_uuid={round.uuid} call_uuid={call.uuid} />
          <RoundReviewersList round_uuid={round.uuid} />
          <RoundSubmissionSection
            round={round}
            call={call}
            refetch={refetch}
            loading={isRefetching}
          />
          <RoundReviewSection
            round={round}
            call={call}
            refetch={refetch}
            loading={isRefetching}
          />
          <RoundAllocationSection
            round={round}
            call={call}
            refetch={refetch}
            loading={isRefetching}
          />
        </div>
      </div>
    </PageBarProvider>
  ) : (
    <InvalidRoutePage />
  );
};
