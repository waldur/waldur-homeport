import { describe, expect, it } from 'vitest';

import { candidateEvidence } from './candidateEvidence';

describe('candidateEvidence', () => {
  it('states resources and home directory either way', () => {
    expect(
      candidateEvidence({
        username: 'jdoe',
        offering_count: 1,
        has_active_resources: false,
        home_directories: [],
      } as any),
    ).toEqual([
      'used on 1 offering(s)',
      'no active resources',
      'no home directory',
    ]);
  });

  it('names the home directories of a live candidate', () => {
    expect(
      candidateEvidence({
        username: 'j.doe',
        offering_count: 2,
        has_active_resources: true,
        home_directories: ['/home/j.doe', '/users/j.doe'],
      } as any),
    ).toEqual([
      'used on 2 offering(s)',
      'has active resources',
      'home directory /home/j.doe, /users/j.doe',
    ]);
  });
});
