import { describe, expect, it } from 'vitest';

import { getDependentSteps, getMissingDependencies } from './constants';

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
