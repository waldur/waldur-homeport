import { useQuery } from '@tanstack/react-query';
import {
  AwardedResource,
  Proposal,
  ProposalRanking,
  proposalProposalsList,
  proposalRankingsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { ENV } from '@/core/config';

const ROUND_RANKING_LOCKED_STATES = ['deciding', 'results_published', 'closed'];

/** Amounts per requested offering uuid, per component type. */
export type RecommendedResources = Record<string, Record<string, number>>;

export const roundRankingsKey = (roundUuid: string) =>
  ['round-rankings', roundUuid] as const;

export const proposalRankingKey = (proposalUuid: string) =>
  ['proposal-ranking', proposalUuid] as const;

/** The ranking is fixed once the round goes to its decision. */
export const isRankingLocked = (lifecycleState?: string | null) =>
  Boolean(lifecycleState) &&
  ROUND_RANKING_LOCKED_STATES.includes(lifecycleState as string);

export const getRecommendedResources = (
  ranking: Pick<ProposalRanking, 'recommended_resources'> | null | undefined,
): RecommendedResources =>
  (ranking?.recommended_resources ?? {}) as RecommendedResources;

/** "cpu 80, gpu 4" for one offering's recommendation. */
export const formatAmounts = (amounts: Record<string, number> | undefined) =>
  Object.entries(amounts ?? {})
    .map(([component, amount]) => `${component} ${amount}`)
    .join(', ');

interface NamedRecommendation {
  requested_offering_uuid: string;
  offering_name: string;
  components: {
    type: string;
    name: string;
    measured_unit: string;
    amount: number;
  }[];
}

/** "CPU hours 80 h, Storage 4 GB": one offering's recommendation, named. */
const formatNamedAmounts = (components: NamedRecommendation['components']) =>
  components
    .map(({ name, measured_unit, amount }) =>
      [name, amount, measured_unit].filter((part) => part !== '').join(' '),
    )
    .join(', ');

/**
 * The ranking's recommendation per requested offering, named for reading;
 * the raw keys where the backend has no names for it.
 */
export const getNamedRecommendation = (
  ranking: Pick<
    ProposalRanking,
    'recommended_resources' | 'recommended_resources_detail'
  >,
): { uuid: string; offering?: string; amounts: string }[] => {
  const detail = ranking.recommended_resources_detail;
  if (detail?.length) {
    return detail.map((row) => ({
      uuid: row.requested_offering_uuid,
      offering: row.offering_name,
      amounts: formatNamedAmounts(row.components),
    }));
  }
  return Object.entries(getRecommendedResources(ranking)).map(
    ([uuid, amounts]) => ({ uuid, amounts: formatAmounts(amounts) }),
  );
};

/**
 * Every ranking of the round -- or of one of its round reports -- whatever
 * page the table shows.
 */
const fetchAllRoundRankings = (roundUuid: string, meetingNoteUuid?: string) =>
  getAllPages((page) =>
    proposalRankingsList({
      query: {
        round_uuid: roundUuid,
        ...(meetingNoteUuid ? { meeting_note_uuid: meetingNoteUuid } : {}),
        page,
        page_size: MAX_PAGE_SIZE,
      },
    }),
  );

/** The round's proposals being evaluated: the ones a ranking may place. */
const fetchRankableProposals = (roundUuid: string) =>
  getAllPages((page) =>
    proposalProposalsList({
      query: {
        round_uuid: roundUuid,
        state: ['submitted', 'in_review'],
        page,
        page_size: MAX_PAGE_SIZE,
      },
    }),
  );

export interface RankingChoices {
  /** The proposals being evaluated not ranked yet. */
  options: { value: string; label: string }[];
  /** The rank after the lowest-placed one. */
  nextRank: number;
}

/** What "Rank proposal" offers, from the whole ranking of the round. */
export const getRankingChoices = (
  proposals: Pick<Proposal, 'uuid' | 'name'>[],
  rankings: Pick<ProposalRanking, 'proposal_uuid' | 'rank'>[],
): RankingChoices => {
  const ranked = new Set(rankings.map((ranking) => ranking.proposal_uuid));
  return {
    options: proposals
      .filter((proposal) => !ranked.has(proposal.uuid))
      .map((proposal) => ({ value: proposal.uuid, label: proposal.name })),
    nextRank:
      rankings.reduce(
        (highest, ranking) => Math.max(highest, ranking.rank),
        0,
      ) + 1,
  };
};

/** A round report a ranking belongs to, and the proposals it covers. */
export interface RankingReport {
  uuid: string;
  proposals: Pick<Proposal, 'uuid' | 'name'>[];
}

export const fetchRankingChoices = async (
  roundUuid: string,
  report?: RankingReport,
): Promise<RankingChoices> => {
  const [proposals, rankings] = await Promise.all([
    report ? report.proposals : fetchRankableProposals(roundUuid),
    fetchAllRoundRankings(roundUuid, report?.uuid),
  ]);
  return getRankingChoices(proposals, rankings);
};

export const rankingExportUrl = (roundUuid: string, meetingNoteUuid?: string) =>
  `${ENV.apiEndpoint}api/proposal-rankings/export_csv/?round_uuid=${roundUuid}` +
  (meetingNoteUuid ? `&meeting_note_uuid=${meetingNoteUuid}` : '');

/**
 * Where the proposal stands in its current round's ranking; null when it is not
 * ranked, or the viewer may not read the ranking (the list then comes back
 * empty, which is not an error).
 */
export const useProposalRanking = (proposalUuid: string, roundUuid?: string) =>
  useQuery({
    queryKey: [...proposalRankingKey(proposalUuid), roundUuid],
    queryFn: () =>
      proposalRankingsList({
        // A ranking belongs to its round: one made before the proposal was
        // moved does not follow it.
        query: { proposal_uuid: proposalUuid, round_uuid: roundUuid },
      }).then((response) => response.data?.[0] ?? null),
    enabled: Boolean(proposalUuid && roundUuid),
    refetchOnWindowFocus: false,
  });

export interface AwardPrefillPatch {
  awarded: AwardedResource;
  limits: Record<string, number>;
  /** The recommendation awards nothing on the offering: the item goes. */
  remove?: boolean;
}

/**
 * The award items to change so that their amounts are the committee's
 * recommendation: the first item on each recommended offering gets the
 * recommended amounts, its other components kept, and is removed when the
 * recommendation awards nothing on its offering. Items whose amounts already
 * match are left out.
 */
export const getAwardPrefillPatches = (
  awards: AwardedResource[],
  recommended: RecommendedResources,
): AwardPrefillPatch[] => {
  const seen = new Set<string>();
  const patches: AwardPrefillPatch[] = [];
  for (const awarded of awards) {
    const offeringUuid = awarded.requested_offering?.uuid;
    if (!offeringUuid || seen.has(offeringUuid)) continue;
    seen.add(offeringUuid);
    const amounts = recommended[offeringUuid];
    if (!amounts || !Object.keys(amounts).length) continue;
    // Zero on every component is a recommendation not to award the
    // offering, which an award item cannot hold: it is removed instead.
    if (Object.values(amounts).every((amount) => !amount)) {
      patches.push({ awarded, limits: {}, remove: true });
      continue;
    }
    const current = (awarded.limits ?? {}) as Record<string, number>;
    const limits = { ...current, ...amounts };
    const changed = Object.entries(amounts).some(
      ([component, amount]) => current[component] !== amount,
    );
    if (changed) {
      patches.push({ awarded, limits });
    }
  }
  return patches;
};
