import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  proposalPublicCallsRetrieve,
  ProposalWorkflowStepInstance,
  type ProposalReview,
} from 'waldur-js-client';

import { Tabs, TabsItem } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { usesCallVocabulary, showsCallContext } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';

import { ReviewDetails } from '../review/ReviewExpandableRow';

import {
  CallTab,
  DocumentsTab,
  EvaluationTab,
  OfferingsTab,
  RoundTab,
} from './ProposalCallTabs';

interface ProposalDetailsDialogProps {
  proposal: Proposal;
  // When opened in a review context (the dedicated review page), the reviewer's
  // review(s) are shown as "Review from X" tabs — the review page itself does
  // not surface the score/summary comments inline.
  reviews?: ProposalReview[];
  /** The proposal's workflow, for the steps where the applicant acts. */
  workflowStates?: ProposalWorkflowStepInstance[];
}

export const ProposalDetailsDialog: FC<ProposalDetailsDialogProps> = ({
  proposal,
  reviews,
  workflowStates,
}) => {
  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicCall', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({ path: { uuid: proposal.call_uuid } }).then(
        (r) => r.data,
      ),

    enabled: showsCallContext(),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const withCall = showsCallContext();
  const reviewTabs = reviews ?? [];
  // The Call tab does not render without call context: open on the round
  // then, or on the first review without either.
  const defaultTab =
    withCall && call
      ? 'call'
      : withCall
        ? 'round'
        : `review-${reviewTabs[0]?.uuid}`;

  const tabs: TabsItem[] = [
    {
      value: 'call',
      title: translate('Call'),
      hidden: !(withCall && call),
      content: call ? <CallTab call={call} /> : null,
    },
    {
      value: 'offerings',
      title: translate('Offerings'),
      hidden: !(withCall && call),
      content: call ? <OfferingsTab call={call} /> : null,
    },
    {
      value: 'documents',
      title: translate('Documents'),
      hidden: !(withCall && call),
      content: call ? <DocumentsTab call={call} /> : null,
    },
    {
      value: 'round',
      title: translate('Round'),
      hidden: !withCall,
      content: <RoundTab call={call} proposal={proposal} />,
    },
    {
      value: 'evaluation',
      title: translate('How it is evaluated'),
      hidden: !(withCall && call),
      content: call ? (
        <EvaluationTab call={call} workflowStates={workflowStates} />
      ) : null,
    },
    ...reviewTabs.map((review) => ({
      value: `review-${review.uuid}`,
      title: translate('Review from {name}', {
        name: review.reviewer_full_name || review.anonymous_reviewer_name,
      }),
      content: <ReviewDetails review={review} />,
    })),
  ];

  return (
    <ModalDialog
      title={
        usesCallVocabulary()
          ? translate('Proposal details overview')
          : translate('Request details overview')
      }
      // A fixed height, so the dialog keeps its size from tab to tab; the
      // tab content scrolls under the tabs.
      bodyClassName="h-[500px] max-h-[500px] flex flex-col"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <Tabs
          defaultValue={defaultTab}
          items={tabs}
          className="flex flex-col grow min-h-0"
          listProps={{ className: 'mb-3' }}
          panelsClassName="grow overflow-auto"
        />
      )}
    </ModalDialog>
  );
};
