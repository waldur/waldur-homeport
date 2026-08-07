import { describe, expect, it } from 'vitest';

import { getProposalProjectName } from './proposalProjectName';

const round = { start_time: '2026-08-05T09:00:00Z' };

describe('proposal project name', () => {
  // Mirrors allocate_proposal: call prefix - round start date - proposal name.
  it('composes the name the allocation will produce', () => {
    expect(
      getProposalProjectName({ backend_id: 'EFP' }, round, 'Quantum sim'),
    ).toBe('EFP - 2026-08-05 - Quantum sim');
  });

  it('falls back to the slug when the call has no backend id', () => {
    expect(
      getProposalProjectName(
        { backend_id: '', slug: 'rolling-access' },
        round,
        'Quantum sim',
      ),
    ).toBe('rolling-access - 2026-08-05 - Quantum sim');
  });

  // Reformatting through a Date would move the day for anyone west of UTC.
  it('takes the date straight from the ISO string', () => {
    expect(
      getProposalProjectName(
        { backend_id: 'EFP' },
        { start_time: '2026-08-05T00:30:00Z' },
        'X',
      ),
    ).toContain('2026-08-05');
  });

  // Better a plain description than a half-composed name.
  it('gives nothing when a piece is missing', () => {
    expect(getProposalProjectName(undefined, round, 'X')).toBeUndefined();
    expect(
      getProposalProjectName({ backend_id: 'EFP' }, {}, 'X'),
    ).toBeUndefined();
    expect(
      getProposalProjectName({ backend_id: 'EFP' }, round, ''),
    ).toBeUndefined();
  });

  it('truncates to the project name limit', () => {
    const name = getProposalProjectName(
      { backend_id: 'EFP' },
      round,
      'x'.repeat(600),
    );
    expect(name).toHaveLength(500);
  });
});
