import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useQuestionNumberValidator } from './utils';

describe('useQuestionNumberValidator', () => {
  it.each(['number', 'year', 'rating'])(
    'checks a %s answer against the range',
    (question_type) => {
      const { result } = renderHook(() =>
        useQuestionNumberValidator({
          question_type,
          min_value: '2000',
          max_value: '2030',
        }),
      );

      expect(result.current('1999')).toBe('Must be between 2000 and 2030.');
      expect(result.current('2010')).toBeUndefined();
    },
  );

  it.each([null, undefined, ''])(
    'leaves an empty answer (%s) to the required check',
    (value) => {
      const { result } = renderHook(() =>
        useQuestionNumberValidator({
          question_type: 'rating',
          min_value: '1',
          max_value: '5',
        }),
      );

      expect(result.current(value)).toBeUndefined();
    },
  );
});
