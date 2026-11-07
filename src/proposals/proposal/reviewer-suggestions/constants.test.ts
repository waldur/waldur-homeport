import { describe, expect, it } from 'vitest';

import { invitationSummary } from './constants';

const result = (outcome: string, detail = '', name = 'Ada Expert') => ({
  candidate: { suggested_user_name: name, email: 'ada@example.com' },
  outcome,
  invited: outcome === 'invited' || outcome === 'resent',
  detail,
});

const response = (results: any[]) =>
  ({
    invited: results.filter((r) => r.outcome === 'invited').length,
    resent: results.filter((r) => r.outcome === 'resent').length,
    linked: results.filter((r) => r.outcome === 'linked').length,
    refused: results.filter((r) => r.outcome === 'refused').length,
    results,
  }) as any;

describe('invitationSummary', () => {
  it('reports what was done when everyone was acted on', () => {
    const summary = invitationSummary(
      response([result('invited'), result('resent'), result('linked')]),
    );
    expect(summary.level).toBe('success');
    expect(summary.message).toContain('1 invited to the reviewer pool.');
    expect(summary.message).toContain('1 expired invitation(s) sent again.');
    expect(summary.message).toContain(
      '1 linked to their existing reviewer pool entry.',
    );
  });

  it('says why each refused person was not invited', () => {
    const summary = invitationSummary(
      response([
        result('invited'),
        result(
          'refused',
          'Declined the invitation on 2026-10-01; not re-invited.',
          'Bob Busy',
        ),
      ]),
    );
    expect(summary.level).toBe('warning');
    expect(summary.message).toContain(
      'Not invited: Bob Busy: Declined the invitation on 2026-10-01; not re-invited.',
    );
  });

  it('does not report success when nobody was invited', () => {
    const summary = invitationSummary(
      response([result('refused', 'Already invited.')]),
    );
    expect(summary.level).toBe('error');
    expect(summary.message).not.toContain('invited to the reviewer pool');
    expect(summary.message).toContain('Already invited.');
  });
});
