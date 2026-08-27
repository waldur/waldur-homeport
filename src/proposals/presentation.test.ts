import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  usesCallVocabulary,
  showsCallColumns,
  showsCallContext,
  showsProposalDuration,
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

const blocks = [
  showsCallContext,
  showsProposalDuration,
  showsWorkflowSteps,
  showsCallColumns,
];

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
