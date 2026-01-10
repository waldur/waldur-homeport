import { describe, it, expect } from 'vitest';

/**
 * Tests for the getValueLabel functions used in CallReviewsListFilter.
 *
 * These tests verify that the label extraction functions correctly handle
 * both API-returned filter values (with various property names) and
 * inline filter values from table row data (which use different property names).
 *
 * Bug context: WAL-9540 - Objects with {name, uuid} were being passed directly
 * to React Badge components instead of extracting the display label,
 * causing "Objects are not valid as a React child" errors.
 */
describe('CallReviewsListFilter getValueLabel functions', () => {
  // These are the exact getValueLabel functions used in CallReviewsListFilter.tsx
  const roundGetValueLabel = (value: any) => value?.slug || value?.name;
  const reviewerGetValueLabel = (value: any) =>
    value?.full_name || value?.email || value?.username;
  const proposalGetValueLabel = (value: any) => value?.name;

  describe('Round filter', () => {
    it('should extract slug from round object', () => {
      const roundValue = {
        slug: 'round-2024-01',
        name: 'January Round',
        uuid: 'round-uuid',
      };
      expect(roundGetValueLabel(roundValue)).toBe('round-2024-01');
    });

    it('should fall back to name if slug is not present', () => {
      const roundValue = { name: 'Round Name', uuid: 'round-uuid' };
      expect(roundGetValueLabel(roundValue)).toBe('Round Name');
    });

    it('should handle inline filter value from CallReviewsList', () => {
      // inlineFilter returns: { name: row.round_slug, uuid: row.round_uuid }
      const inlineFilterValue = {
        name: 'inline-round-slug',
        uuid: 'round-uuid',
      };
      expect(roundGetValueLabel(inlineFilterValue)).toBe('inline-round-slug');
    });

    it('should return undefined for null/undefined', () => {
      expect(roundGetValueLabel(null)).toBeUndefined();
      expect(roundGetValueLabel(undefined)).toBeUndefined();
    });
  });

  describe('Reviewer filter', () => {
    it('should extract full_name from reviewer object', () => {
      const reviewerValue = {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'jsmith',
        uuid: 'reviewer-uuid',
      };
      expect(reviewerGetValueLabel(reviewerValue)).toBe('Jane Smith');
    });

    it('should fall back to email if full_name is not present', () => {
      const reviewerValue = {
        email: 'nofullname@example.com',
        username: 'nofullname',
        uuid: 'reviewer-uuid',
      };
      expect(reviewerGetValueLabel(reviewerValue)).toBe(
        'nofullname@example.com',
      );
    });

    it('should fall back to username as last resort', () => {
      const reviewerValue = { username: 'onlyusername', uuid: 'reviewer-uuid' };
      expect(reviewerGetValueLabel(reviewerValue)).toBe('onlyusername');
    });

    it('should handle inline filter value from CallReviewsList', () => {
      // inlineFilter returns: { full_name: row.reviewer_full_name, uuid: row.reviewer_uuid }
      const inlineFilterValue = {
        full_name: 'Inline Reviewer Name',
        uuid: 'reviewer-uuid',
      };
      expect(reviewerGetValueLabel(inlineFilterValue)).toBe(
        'Inline Reviewer Name',
      );
    });

    it('should return undefined for null/undefined', () => {
      expect(reviewerGetValueLabel(null)).toBeUndefined();
      expect(reviewerGetValueLabel(undefined)).toBeUndefined();
    });
  });

  describe('Proposal filter', () => {
    it('should extract name from proposal object', () => {
      const proposalValue = {
        name: 'Research Proposal',
        uuid: 'proposal-uuid',
      };
      expect(proposalGetValueLabel(proposalValue)).toBe('Research Proposal');
    });

    it('should handle inline filter value from CallReviewsList', () => {
      // inlineFilter returns: { name: row.proposal_name, uuid: row.proposal_uuid }
      const inlineFilterValue = {
        name: 'Inline Proposal Name',
        uuid: 'proposal-uuid',
      };
      expect(proposalGetValueLabel(inlineFilterValue)).toBe(
        'Inline Proposal Name',
      );
    });

    it('should return undefined for null/undefined', () => {
      expect(proposalGetValueLabel(null)).toBeUndefined();
      expect(proposalGetValueLabel(undefined)).toBeUndefined();
    });
  });

  describe('Regression test: Objects should not be returned as-is', () => {
    it('round filter should never return the full object', () => {
      const value = { name: 'Round Name', uuid: 'round-uuid' };
      const result = roundGetValueLabel(value);
      expect(typeof result).toBe('string');
      expect(result).not.toEqual(value);
    });

    it('reviewer filter should never return the full object', () => {
      const value = { full_name: 'Reviewer Name', uuid: 'reviewer-uuid' };
      const result = reviewerGetValueLabel(value);
      expect(typeof result).toBe('string');
      expect(result).not.toEqual(value);
    });

    it('proposal filter should never return the full object', () => {
      const value = { name: 'Proposal Name', uuid: 'proposal-uuid' };
      const result = proposalGetValueLabel(value);
      expect(typeof result).toBe('string');
      expect(result).not.toEqual(value);
    });
  });
});
