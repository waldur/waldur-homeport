import { describe, expect, it } from 'vitest';

import { withParam } from './router';

describe('withParam', () => {
  it('sets the provider and keeps the proposal, its other parameters and the hash', () => {
    const href =
      'https://portal.example.org/proposals/abc/?provider=theirs&tab=mine#step-contributions-1';
    expect(withParam('provider', 'mine', href)).toBe(
      '/proposals/abc/?provider=mine&tab=mine#step-contributions-1',
    );
  });

  it('adds the provider to a URL without one', () => {
    const href = 'https://portal.example.org/awards/?state=done';
    expect(withParam('provider', 'p1', href)).toBe(
      '/awards/?state=done&provider=p1',
    );
  });
});
