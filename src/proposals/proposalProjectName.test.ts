import { describe, expect, it } from 'vitest';

import { getProposalProjectName } from './proposalProjectName';

const round = { start_time: '2026-08-05T09:00:00Z' };

describe('proposal project name', () => {
  // Mirrors allocation_names: the call's template, else
  // call prefix - round start date - proposal name.
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

  it('renders the call template', () => {
    expect(
      getProposalProjectName(
        { slug: 'store', project_name_template: '{proposal_name}' },
        round,
        'Clinical school',
      ),
    ).toBe('Clinical school');
    expect(
      getProposalProjectName(
        {
          backend_id: 'ST',
          slug: 'store',
          name: 'Storage',
          project_name_template:
            '{call_prefix}/{call_slug}/{call_name}/{round_start}/{round_slug}: {proposal_name}',
        },
        { ...round, slug: 'R1' },
        'X',
      ),
    ).toBe('ST/store/Storage/2026-08-05/R1: X');
  });

  it('keeps braces in the proposal name literally', () => {
    expect(
      getProposalProjectName(
        { slug: 'store', project_name_template: '{proposal_name}' },
        round,
        'A {round_start} B',
      ),
    ).toBe('A {round_start} B');
  });

  // Only allocation knows the proposal slug and the organization's slug.
  it('gives nothing for a placeholder only allocation can fill', () => {
    expect(
      getProposalProjectName(
        { slug: 'store', project_name_template: '{proposal_slug}' },
        round,
        'X',
      ),
    ).toBeUndefined();
  });

  it('uses the default name for an empty template', () => {
    expect(
      getProposalProjectName(
        { backend_id: 'EFP', project_name_template: '  ' },
        round,
        'X',
      ),
    ).toBe('EFP - 2026-08-05 - X');
  });
});
