import {
  NestedRound,
  Offering,
  proposalPublicCallsList,
  PublicCall,
} from 'waldur-js-client';

/** A round a proposal can still be submitted to, with the call it belongs to. */
export interface SubmittableRound {
  /** Row identity for the picker; the round is what a proposal is created on. */
  uuid: string;
  call: PublicCall;
  round: NestedRound;
}

/**
 * Only rounds that are open right now.
 *
 * The write path also accepts a scheduled round, and the backend's
 * open_for_proposals predicate admits one — but offering a round that has not
 * started asks the user to commit to a deadline they cannot act on yet, and
 * the design is explicit that only calls with an open round are listed.
 */
const isSubmittable = (round: NestedRound) => round.status === 'open';

/**
 * Every round still accepting proposals, open ones first.
 *
 * A proposal is created on a round, not a call, and a call may have an open
 * round and a scheduled one at the same time — so the choice is offered per
 * round rather than silently taking the earliest.
 */
export const getSubmittableRounds = (
  calls: PublicCall[],
): SubmittableRound[] => {
  const rows = calls.flatMap((call) =>
    (call.rounds || []).filter(isSubmittable).map((round) => ({
      uuid: round.uuid,
      call,
      round,
    })),
  );
  // Soonest deadline first: the one the user is most likely to be acting on.
  return rows.sort((a, b) =>
    a.round.cutoff_time < b.round.cutoff_time ? -1 : 1,
  );
};

/** The endpoint paginates at 10, which would silently hide eligible calls. */
const CALL_PAGE_SIZE = 100;

/**
 * Calls a proposal for this offering can be submitted to right now.
 *
 * Eligibility is the backend's call — `open_for_offering_uuid` is the twin of
 * the `open_for_proposals` field, both built on
 * RequestedOfferingQuerySet.open_for_proposals.
 */
export const fetchEligibleCalls = async (
  offering: Offering,
): Promise<PublicCall[]> => {
  const response = await proposalPublicCallsList({
    query: {
      open_for_offering_uuid: offering.uuid,
      page_size: CALL_PAGE_SIZE,
    },
  });
  // The filter already guarantees a live round; this drops any that slipped
  // through, so getSubmittableRounds never yields an empty call.
  return (response.data || []).filter((call) =>
    (call.rounds || []).some(isSubmittable),
  );
};
