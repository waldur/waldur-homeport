import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsList, proposalRankingsList } from 'waldur-js-client';

import { fetchRankingChoices, getRankingChoices } from './rankings';

const PAGE_SIZE = 10;

/** One page of ``items`` as the API answers it, with a next link if more. */
const paged = <T>(items: T[]) =>
  vi.fn(({ query }: { query: { page: number } }) => {
    const start = (query.page - 1) * PAGE_SIZE;
    const hasNext = start + PAGE_SIZE < items.length;
    return Promise.resolve({
      data: items.slice(start, start + PAGE_SIZE),
      response: {
        headers: new Headers(
          hasNext
            ? { link: `<http://api/?page=${query.page + 1}>; rel="next"` }
            : {},
        ),
      },
    });
  });

const proposals = Array.from({ length: 14 }, (_, index) => ({
  uuid: `p${index + 1}`,
  name: `Proposal ${index + 1}`,
}));
// Twelve ranked -- more than a page -- the lowest placed at 12.
const rankings = proposals.slice(0, 12).map((proposal, index) => ({
  proposal_uuid: proposal.uuid,
  rank: index + 1,
}));

describe('fetchRankingChoices', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsList).mockImplementation(
      paged(proposals) as any,
    );
    vi.mocked(proposalRankingsList).mockImplementation(paged(rankings) as any);
  });

  it('offers only the proposals not ranked on any page', async () => {
    const choices = await fetchRankingChoices('round-1');
    expect(choices.options).toEqual([
      { value: 'p13', label: 'Proposal 13' },
      { value: 'p14', label: 'Proposal 14' },
    ]);
    expect(vi.mocked(proposalRankingsList)).toHaveBeenCalledTimes(2);
  });

  it('proposes the rank after the lowest placed on any page', async () => {
    const choices = await fetchRankingChoices('round-1');
    expect(choices.nextRank).toBe(13);
  });
});

describe('getRankingChoices', () => {
  it('starts at rank 1 for an empty ranking', () => {
    expect(getRankingChoices(proposals.slice(0, 2), [])).toEqual({
      options: [
        { value: 'p1', label: 'Proposal 1' },
        { value: 'p2', label: 'Proposal 2' },
      ],
      nextRank: 1,
    });
  });
});
