import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import {
  Proposal,
  proposalProposalsCount,
  proposalProposalsList,
} from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { formatDate, formatDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { isOpenEnded } from '@/proposals/roundCutoff';
import { ProposalStatesOptions } from '@/table/generated/ProposalsFilter';
import { useUser } from '@/workspace/hooks';

type ProposalState = Proposal['state'];

const IN_REVIEW: ProposalState[] = ['submitted', 'in_review'];

const countOwn = async (state: ProposalState[]) =>
  fetchResultCount(
    await proposalProposalsCount({ query: { as_role: 'applicant', state } }),
  );

/** The draft whose round closes first, among those still open to submit. */
const nextDraft = async (): Promise<Proposal | undefined> => {
  const { data } = await proposalProposalsList({
    query: {
      as_role: 'applicant',
      state: ['draft'],
      o: ['round__cutoff_time'],
      page_size: 20,
    },
  });
  const now = Date.now();
  return data.find(
    (proposal) =>
      proposal.round?.cutoff_time &&
      !isOpenEnded(proposal.round) &&
      new Date(proposal.round.cutoff_time).getTime() > now,
  );
};

const useMyCallWork = () => {
  const user = useUser();
  return useQuery({
    queryKey: ['my-call-work', user?.uuid],
    queryFn: async () => {
      const [drafts, inReview, awarded, next] = await Promise.all([
        countOwn(['draft']),
        countOwn(IN_REVIEW),
        countOwn(['accepted']),
        nextDraft(),
      ]);
      return { drafts, inReview, awarded, next };
    },
    enabled: !!user?.uuid,
    refetchOnWindowFocus: false,
  });
};

const MY_PROPOSALS_STATE = 'proposals-all-proposals';

const stateOptions = (states: ProposalState[]) =>
  ProposalStatesOptions.filter((option) =>
    states.includes(option.value as ProposalState),
  );

/** My proposals, filtered to these states the way the list's own filter
 *  writes them into the URL. */
const proposalsLink = (states: ProposalState[]) => ({
  to: MY_PROPOSALS_STATE,
  params: { state: JSON.stringify(stateOptions(states)) },
});

interface CountItem {
  count: number;
  label: string;
  link: ReturnType<typeof proposalsLink>;
}

/**
 * What the next-deadline card says beside its date: which draft, in which
 * call, and how long is left. It sits above a list of calls, so without the
 * draft and the call it read as the next cut-off among those calls.
 */
const NextDraftFooter: FC<{ draft: Proposal }> = ({ draft }) => (
  <div
    className="min-w-0 w-full text-sm"
    title={translate('{proposal} in {call} closes {date}.', {
      proposal: draft.name,
      call: draft.call_name,
      date: formatDateTime(draft.round.cutoff_time),
    })}
  >
    <div className="truncate font-medium text-secondary">{draft.name}</div>
    {/* The time left first: a long call name is what gets cut. */}
    <div className="truncate text-quaternary">
      {formatRelative(draft.round.cutoff_time)} · {draft.call_name}
    </div>
  </div>
);

/**
 * The signed-in applicant's own work on calls, as summary cards above the
 * calls table: what is in draft, in review and awarded, and the draft whose
 * round closes first. Each card links to the list or draft behind it, and a
 * count of nothing is left out; with nothing at all the `fallback` shows
 * instead.
 */
export const MyCallWorkSummary: FC<{ fallback?: ReactNode }> = ({
  fallback = null,
}) => {
  const { data, isLoading } = useMyCallWork();
  const proposals = (states: ProposalState[]) => ({
    link: proposalsLink(states),
  });

  const counts = [
    data?.drafts && {
      count: data.drafts,
      label: translate('In draft'),
      ...proposals(['draft']),
    },
    data?.inReview && {
      count: data.inReview,
      label: translate('In review'),
      ...proposals(IN_REVIEW),
    },
    data?.awarded && {
      count: data.awarded,
      label: translate('Awarded'),
      ...proposals(['accepted']),
    },
  ].filter(Boolean) as CountItem[];

  if (isLoading) {
    return null;
  }
  if (!counts.length && !data?.next) {
    return <>{fallback}</>;
  }

  return (
    <div className="mt-4" data-testid="my-call-work">
      <StatCardGrid
        stats={[
          ...counts.map((item) => ({
            label: item.label,
            value: item.count,
            link: item.link,
          })),
          ...(data?.next
            ? [
                {
                  label: translate('Next draft deadline'),
                  value: formatDate(data.next.round.cutoff_time),
                  footer: <NextDraftFooter draft={data.next} />,
                  link: {
                    to: 'proposals.manage-proposal',
                    params: { proposal_uuid: data.next.uuid },
                    label: translate('Open draft'),
                  },
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};
