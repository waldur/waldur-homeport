import { describe, expect, it } from 'vitest';

import { suggestionStatusLabel, suggestionStatusVariant } from './constants';
import { candidateLabel, validateSuggestion } from './SuggestReviewerDialog';

describe('validateSuggestion', () => {
  it('takes a user or an address', () => {
    expect(validateSuggestion({ user: { uuid: 'u' } as any })).toEqual({});
    expect(validateSuggestion({ email: 'a@example.com' })).toEqual({});
  });

  it('refuses neither and both', () => {
    expect(validateSuggestion({})).toHaveProperty('email');
    expect(validateSuggestion({ email: '  ' })).toHaveProperty('email');
    expect(
      validateSuggestion({
        user: { uuid: 'u' } as any,
        email: 'a@example.com',
      }),
    ).toHaveProperty('email');
  });
});

describe('suggestion status', () => {
  it('follows the pool invitation', () => {
    expect(suggestionStatusLabel('expired')).toBe('Invitation expired');
    expect(suggestionStatusVariant('accepted')).toBe('success');
    expect(suggestionStatusVariant('unknown')).toBe('neutral');
  });
});

describe('candidateLabel', () => {
  const candidate = {
    uuid: 'u',
    full_name: 'Marie Curie',
    affiliation: null,
    has_published_profile: true,
    pool_status: null,
    has_conflict: false,
  };

  it('names the candidate with their affiliation, never an address', () => {
    expect(candidateLabel(candidate)).toBe('Marie Curie');
    expect(
      candidateLabel({ ...candidate, affiliation: 'Radium Institute' }),
    ).toBe('Marie Curie (Radium Institute)');
  });
});
