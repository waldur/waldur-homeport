import { describe, expect, it } from 'vitest';

import fixture from './statusLabelPlaceholders.fixture.json';
import {
  cleanStatusLabels,
  countStatusLabels,
  STATUS_LABEL_AUDIENCES,
  STATUS_LABEL_PLACEHOLDERS,
  StatusLabelAudience,
  statusLabelProblem,
} from './statusLabels';

describe('status label placeholders', () => {
  it('lists the audiences and counts the backend knows', () => {
    expect([...STATUS_LABEL_AUDIENCES]).toEqual(fixture.audiences);
    expect([...STATUS_LABEL_PLACEHOLDERS]).toEqual(fixture.placeholders);
  });

  it.each(fixture.cases)(
    '$audience "$text" is valid: $valid',
    ({ audience, text, valid }) => {
      const problem = statusLabelProblem(audience as StatusLabelAudience, text);
      expect(problem === undefined).toBe(valid);
    },
  );
});

describe('cleanStatusLabels', () => {
  it('keeps every audience, trimmed, and drops empty texts', () => {
    expect(
      cleanStatusLabels({
        evaluators: { active: ' Under Assessment ' },
        call_team: { active: '{submitted} of {expected}', completed: '' },
        offering_team: { outcomes: { accepted: 'Feasible', rejected: ' ' } },
      }),
    ).toEqual({
      evaluators: { active: 'Under Assessment' },
      call_team: { active: '{submitted} of {expected}' },
      offering_team: { outcomes: { accepted: 'Feasible' } },
    });
  });

  it('counts the labels of every audience', () => {
    expect(
      countStatusLabels({
        applicant: { active: 'A' },
        evaluators: { active: 'B' },
        call_team: { active: 'C', completed: 'D' },
        offering_team: { outcomes: { accepted: 'E' } },
      }),
    ).toBe(5);
  });
});
