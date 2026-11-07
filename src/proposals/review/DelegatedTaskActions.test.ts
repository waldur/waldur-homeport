import { describe, expect, it } from 'vitest';

import { taskContributionUuid } from './DelegatedTaskActions';

describe('taskContributionUuid', () => {
  it('reads the contribution a task names', () => {
    expect(taskContributionUuid({ key: 'contribution:abc' } as any)).toBe(
      'abc',
    );
  });

  it('names none for a task about a step', () => {
    expect(taskContributionUuid({ key: 'step:abc' } as any)).toBeUndefined();
  });
});
