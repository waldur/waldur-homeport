import { describe, expect, it } from 'vitest';

import {
  assertionText,
  namedScenario,
  scenarioCount,
  scenarioKey,
  scenarioOutcome,
  scenarioRows,
} from './checks';

describe('assertionText', () => {
  it('reads a scenario assertion in words', () => {
    const names = new Map([
      ['administrative_check', 'Administrative check'],
      ['review', 'Expert review'],
    ]);
    expect(assertionText({ proposal_state: 'rejected' }, names)).toBe(
      'The proposal ends Rejected',
    );
    expect(
      assertionText(
        {
          step_status: {
            step: 'administrative_check',
            status: 'completed',
            outcome: 'ineligible',
          },
        },
        names,
      ),
    ).toBe('Administrative check is completed · Ineligible');
    expect(
      assertionText(
        {
          notified: {
            actor: 'applicant',
            trigger: 'step_completed',
            step: 'review',
            count: 2,
          },
        },
        names,
      ),
    ).toBe('Mail: the applicant · Step completed · at Expert review (2 mails)');
    expect(
      assertionText({ hidden: { role: 'applicant', step: 'review' } }, names),
    ).toBe('The applicant does not see Expert review');
    expect(
      assertionText({
        label: { audience: 'applicant', outcome: 'ineligible', text: 'X' },
      }),
    ).toBe('The applicant label for Ineligible reads “X”');
  });

  it('leaves a step it has no name for as its key', () => {
    expect(assertionText({ ends_at: 'final_report' })).toBe(
      'The workflow ends at final_report',
    );
  });

  it('shows an unknown entry as written', () => {
    expect(assertionText({ novel: 1 })).toBe('{"novel":1}');
  });
});

describe('summaries', () => {
  it('counts the scenarios', () => {
    expect(scenarioCount(1)).toBe('1 scenario');
    expect(scenarioCount(5)).toBe('5 scenarios');
  });

  it('says how the last run went, worst first', () => {
    expect(
      scenarioOutcome({ total: 5, passed: 5, failed: 0, error: 0 }),
    ).toEqual({ variant: 'success', label: '5 passed' });
    expect(
      scenarioOutcome({ total: 5, passed: 3, failed: 1, error: 1 }),
    ).toEqual({ variant: 'danger', label: '1 failed' });
    expect(
      scenarioOutcome({ total: 5, passed: 4, failed: 0, error: 1 }),
    ).toEqual({ variant: 'warning', label: '1 could not run' });
  });
});

describe('scenarioRows', () => {
  const passed = { key: 'accepted', name: 'Accepted', status: 'passed' } as any;

  it('lists the scenarios before they have ever run', () => {
    const rows = scenarioRows(
      [
        {
          key: 'accepted',
          name: 'Accepted',
          description: 'Every step passes.',
          assertions: [{ proposal_state: 'accepted' }],
        },
      ],
      [],
    );
    expect(rows).toEqual([
      {
        key: 'accepted',
        name: 'Accepted',
        description: 'Every step passes.',
        assertions: [{ proposal_state: 'accepted' }],
        result: undefined,
      },
    ]);
  });

  it('pairs each scenario with its last result and drops stale ones', () => {
    const stale = { key: 'removed', name: 'Removed', status: 'failed' } as any;
    const rows = scenarioRows(
      [
        { key: 'accepted', name: 'Accepted' },
        { key: 'rejected', name: 'Rejected' },
      ],
      [passed, stale],
    );
    expect(rows.map((row) => [row.key, row.result?.status])).toEqual([
      ['accepted', 'passed'],
      ['rejected', undefined],
    ]);
  });

  it('lists the results as they are without the scenarios written out', () => {
    expect(scenarioRows(undefined, [passed])[0]).toMatchObject({
      key: 'accepted',
      name: 'Accepted',
      result: passed,
    });
  });
});

describe('naming a scenario', () => {
  it('derives the key from the name unless one is given', () => {
    expect(scenarioKey('Rejected at the admin check!')).toBe(
      'rejected_at_the_admin_check',
    );
    const draft = { request: { offerings: 1, actions: [] }, assertions: [] };
    expect(namedScenario(draft, { name: 'Happy path' })).toMatchObject({
      key: 'happy_path',
      name: 'Happy path',
      description: '',
      request: { offerings: 1, actions: [] },
    });
    expect(namedScenario(draft, { name: 'Happy path', key: 'mine' }).key).toBe(
      'mine',
    );
  });
});
