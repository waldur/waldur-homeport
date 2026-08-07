import { describe, expect, it } from 'vitest';

import {
  getDependentSteps,
  getMissingDependencies,
  isReviewBearingStep,
} from './constants';

describe('workflow step dependency helpers', () => {
  describe('getMissingDependencies', () => {
    it('reports a dependency that is not enabled', () => {
      expect(getMissingDependencies('panel_review', new Set())).toEqual([
        'expert_review',
      ]);
    });

    it('reports nothing once the dependency is enabled', () => {
      expect(
        getMissingDependencies('panel_review', new Set(['expert_review'])),
      ).toEqual([]);
    });

    it('reports nothing for a step without dependencies', () => {
      expect(getMissingDependencies('expert_review', new Set())).toEqual([]);
    });
  });

  describe('getDependentSteps', () => {
    it('lists steps that depend on the given step', () => {
      expect(getDependentSteps('expert_review')).toContain('panel_review');
    });

    it('returns nothing for a step nothing depends on', () => {
      expect(getDependentSteps('panel_review')).toEqual([]);
    });
  });
});

describe('isReviewBearingStep', () => {
  it.each(['expert_review', 'panel_review'] as const)(
    'accepts %s, whose work the reviewers do',
    (step) => {
      expect(isReviewBearingStep(step)).toBe(true);
    },
  );

  it.each([
    'administrative_check',
    'technical_assessment',
    'allocation_decision',
    'award_response',
  ] as const)('rejects %s, where no review is due yet', (step) => {
    expect(isReviewBearingStep(step)).toBe(false);
  });

  // A proposal on a call that runs no workflow has no active step; callers
  // treat that as "unrestricted", so this must not claim otherwise.
  it('rejects an absent step', () => {
    expect(isReviewBearingStep(null)).toBe(false);
    expect(isReviewBearingStep(undefined)).toBe(false);
  });
});
