import { describe, expect, it } from 'vitest';

import {
  getQuestionsReason,
  MAX_SURVEY_QUESTIONS,
  requiredText,
  validateEndsAt,
} from './validation';

describe('survey wizard validation', () => {
  it('refuses an end that is not after the start', () => {
    const values = { starts_at: '2026-12-01T10:00:00Z' };
    expect(validateEndsAt('2026-12-01T10:00:00Z', values)).toBeTruthy();
    expect(validateEndsAt('2026-11-30T10:00:00Z', values)).toBeTruthy();
    expect(validateEndsAt('2026-12-02T10:00:00Z', values)).toBeUndefined();
  });

  it('refuses a text of only spaces', () => {
    expect(requiredText('   ')).toBeTruthy();
    expect(requiredText(' Survey ')).toBeUndefined();
  });

  it('caps the number of questions at the server limit', () => {
    const questions = Array.from(
      { length: MAX_SURVEY_QUESTIONS + 1 },
      (_, index) => ({ description: `Q${index}` }),
    ) as any;
    expect(getQuestionsReason(questions)).toMatch(/at most/);
    expect(getQuestionsReason(questions.slice(1))).toBeUndefined();
  });
});
