import { describe, expect, it } from 'vitest';

import { sectionFromHash, withParam } from './router';

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

describe('sectionFromHash', () => {
  it('decodes the id a hash names', () => {
    expect(sectionFromHash('#step-contributions-1')).toBe(
      'step-contributions-1',
    );
    expect(sectionFromHash('#a%20b')).toBe('a b');
  });

  it('is null for no hash and for a malformed escape', () => {
    expect(sectionFromHash('')).toBeNull();
    expect(sectionFromHash('#')).toBeNull();
    expect(sectionFromHash('#%E0')).toBeNull();
  });
});
