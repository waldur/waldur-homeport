import { FC, PropsWithChildren } from 'react';

import {
  ReviewerProfileSummaryCard,
  useMyReviewerProfile,
} from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useReviewingStanding } from './tabs';

const ReviewerHeader: FC<PropsWithChildren> = ({ children }) => {
  const { data: profile, isLoading } = useMyReviewerProfile();
  return (
    <div className="flex flex-col gap-4">
      <ReviewerProfileSummaryCard />
      {/* The table waits for the profile, so the stats never push it down
          once it is drawn. It renders without a profile too: the tabs live
          on it, and the card says how to create one. */}
      {!isLoading && (
        <>
          {profile && <ReviewStatsWidgets />}
          {children}
        </>
      )}
    </div>
  );
};

/**
 * The header every My reviews tab shares. Someone who does review work
 * (``useReviewingStanding``: a reviewer, or an invitee who has yet to accept)
 * sees their reviewer profile, or the prompt to create one, and once they
 * have one their review stats above the tab's table; anyone else -- an
 * applicant with tasks, an evaluator holding a proposal role -- sees the
 * table alone. The profile query has a fixed key, so
 * switching tab draws the header from the cache rather than reloading it.
 */
export const MyReviewsLayout: FC<PropsWithChildren> = ({ children }) => {
  const { reviewing } = useReviewingStanding();
  if (!reviewing) {
    return <>{children}</>;
  }
  return <ReviewerHeader>{children}</ReviewerHeader>;
};
