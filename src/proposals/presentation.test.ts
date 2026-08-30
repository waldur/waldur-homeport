import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  usesCallVocabulary,
  requestNoun,
  requestStateLabel,
  requestViewLabel,
  showsCallColumns,
  showsCallContext,
  showsWorkflowSteps,
} from './presentation';

const setMode = (mode?: string) => {
  (ENV as any).plugins = {
    ...(ENV as any).plugins,
    WALDUR_CORE: {
      ...(ENV as any).plugins?.WALDUR_CORE,
      SERVICE_ACCESS_MODE: mode,
    },
  };
};

const blocks = [showsCallContext, showsWorkflowSteps, showsCallColumns];

describe('request presentation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // `both` is the backend default, so a deployment that has not been migrated
  // keeps the call vocabulary rather than silently losing it.
  it('keeps every call-derived block in call-managed modes', () => {
    for (const mode of ['both', 'calls', undefined]) {
      setMode(mode);
      expect(usesCallVocabulary()).toBe(true);
      for (const block of blocks) {
        expect(block()).toBe(true);
      }
    }
  });

  it('drops every call-derived block in marketplace mode', () => {
    setMode('marketplace');
    expect(usesCallVocabulary()).toBe(false);
    for (const block of blocks) {
      expect(block()).toBe(false);
    }
  });

  // The blocks move as one: an applicant never meets a half-de-called view
  // where, say, the duration is gone but the call name remains.
  it('never splits the vocabulary from the blocks', () => {
    for (const mode of ['calls', 'marketplace', 'both', undefined]) {
      setMode(mode);
      for (const block of blocks) {
        expect(block()).toBe(usesCallVocabulary());
      }
    }
  });
});

describe('request vocabulary', () => {
  it('names the request lens after whatever the request is called', () => {
    setMode('both');
    expect(requestNoun()).toBe('Proposal');
    expect(requestViewLabel()).toBe('By proposal');

    setMode('marketplace');
    expect(requestNoun()).toBe('Access request');
    expect(requestViewLabel()).toBe('By access request');
  });

  // The opposite lens is "By resource" — a resource *request*. Shortening this
  // one to "By request" would make the pair name the same thing twice.
  it('keeps the qualifier that tells the two lenses apart', () => {
    setMode('marketplace');
    expect(requestViewLabel()).not.toBe('By request');
  });

  it('titles the state column with a state, not with the noun', () => {
    setMode('both');
    expect(requestStateLabel()).toBe('Proposal state');

    setMode('marketplace');
    expect(requestStateLabel()).toBe('Access request state');
  });

  // The bare noun titles the *name* column on the request list. Reusing it
  // over a state badge would give one word two meanings on adjacent lenses.
  it('never titles the state column with the bare noun', () => {
    for (const mode of ['both', 'calls', 'marketplace', undefined]) {
      setMode(mode);
      expect(requestStateLabel()).not.toBe(requestNoun());
    }
  });
});
