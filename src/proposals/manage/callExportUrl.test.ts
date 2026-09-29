import { describe, expect, it } from 'vitest';

import { buildCallExportUrl } from './callExportUrl';

const call = { url: 'https://example.com/api/proposal-protected-calls/abc/' };

describe('buildCallExportUrl', () => {
  it('appends the action to the call URL', () => {
    expect(buildCallExportUrl(call, 'export-proposals', 'proposal_state')).toBe(
      'https://example.com/api/proposal-protected-calls/abc/export-proposals/',
    );
  });

  it('carries the round filter through', () => {
    expect(
      buildCallExportUrl(call, 'export-reviews', 'review_state', {
        round_uuid: 'r1',
      }),
    ).toContain('?round_uuid=r1');
  });

  // A bare `state` would be read as the call's own and rejected.
  it('renames the state filter and repeats it per value', () => {
    const url = buildCallExportUrl(call, 'export-proposals', 'proposal_state', {
      state: ['submitted', 'in_review'],
    });
    expect(url).toContain('proposal_state=submitted');
    expect(url).toContain('proposal_state=in_review');
    expect(url).not.toMatch(/[?&]state=/);
  });

  it('leaves the query out when nothing is filtered', () => {
    expect(
      buildCallExportUrl(call, 'export-proposals', 'proposal_state', {}),
    ).not.toContain('?');
  });
});

// Dropping these would return every row under a filename implying otherwise.
describe('buildCallExportUrl filters', () => {
  it('carries the applicant filter', () => {
    const url = buildCallExportUrl(call, 'export-proposals', 'proposal_state', {
      created_by_uuid: 'u1',
    });
    expect(url).toContain('created_by_uuid=u1');
  });

  it('carries the reviewer and proposal filters', () => {
    const url = buildCallExportUrl(call, 'export-reviews', 'review_state', {
      reviewer_uuid: 'r1',
      proposal_uuid: 'p1',
    });
    expect(url).toContain('reviewer_uuid=r1');
    expect(url).toContain('proposal_uuid=p1');
  });

  it('carries the search box as a name filter', () => {
    const url = buildCallExportUrl(
      call,
      'export-proposals',
      'proposal_state',
      undefined,
      'perovskite',
    );
    expect(url).toContain('proposal_name=perovskite');
  });
});
