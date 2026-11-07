import { describe, expect, it } from 'vitest';

import { previewFacts } from './previewFacts';

const view = (states: Record<string, any>[]) =>
  ({
    role: 'applicant',
    responses: {
      proposal: { status: 200, data: {} },
      workflow_states: { status: 200, data: states },
    },
  }) as any;

describe('preview facts', () => {
  it('counts one internal step in the singular', () => {
    expect(
      previewFacts(view([{ status: 'pending', applicant_visible: false }])),
    ).toContain('1 step reads as "Internal check".');
    expect(
      previewFacts(
        view([
          { status: 'pending', applicant_visible: false },
          { status: 'active', applicant_visible: false },
        ]),
      ),
    ).toContain('2 steps read as "Internal check".');
  });

  it('speaks of the only completed step as such', () => {
    expect(
      previewFacts(
        view([{ status: 'completed', outcome: null, applicant_visible: true }]),
      ),
    ).toContain('Outcome hidden on the only completed step.');
  });
});
