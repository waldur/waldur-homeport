import { describe, expect, it } from 'vitest';

import { getPublishedRounds } from './CallResultsPage';

const round = (name: string, lifecycle_state: string | null) =>
  ({ uuid: `${name}-uuid`, name, lifecycle_state }) as any;

describe('getPublishedRounds', () => {
  it('keeps only the rounds whose results are out, with their call', () => {
    const rounds = getPublishedRounds([
      {
        uuid: 'call-uuid',
        name: 'Extreme Scale Access',
        rounds: [
          round('Published round', 'results_published'),
          round('Closed round', 'closed'),
          round('Deciding round', 'deciding'),
          round('Open round', null),
        ],
      },
    ]);

    expect(rounds.map((r) => [r.name, r.call_name])).toEqual([
      ['Published round', 'Extreme Scale Access'],
      ['Closed round', 'Extreme Scale Access'],
    ]);
  });
});
