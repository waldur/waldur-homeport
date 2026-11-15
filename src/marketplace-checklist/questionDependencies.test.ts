import { describe, expect, it } from 'vitest';

import {
  evaluateCondition,
  evaluateQuestionVisibility,
  getVisibleQuestions,
} from './questionDependencies';

const condition = (operator: string, required_value: unknown) => ({
  question_description: 'Parent',
  operator,
  required_value,
});

describe('evaluateCondition', () => {
  it('compares multi-select answers by value for equals', () => {
    expect(evaluateCondition(condition('equals', ['a']), ['a'])).toBe(true);
    expect(evaluateCondition(condition('equals', ['a', 'b']), ['b', 'a'])).toBe(
      true,
    );
    expect(evaluateCondition(condition('equals', ['a']), ['a', 'b'])).toBe(
      false,
    );
  });

  it('compares multi-select answers by value for not_equals', () => {
    expect(evaluateCondition(condition('not_equals', ['a']), ['a'])).toBe(
      false,
    );
    expect(
      evaluateCondition(condition('not_equals', ['a', 'b']), ['b', 'a']),
    ).toBe(false);
    expect(evaluateCondition(condition('not_equals', ['a']), ['b'])).toBe(true);
  });

  it('compares single values strictly', () => {
    expect(evaluateCondition(condition('equals', true), true)).toBe(true);
    expect(evaluateCondition(condition('equals', true), false)).toBe(false);
    expect(evaluateCondition(condition('not_equals', 5), 5)).toBe(false);
    expect(evaluateCondition(condition('not_equals', 5), 6)).toBe(true);
  });

  it('compares a single-select form value with its stored array value', () => {
    expect(evaluateCondition(condition('equals', ['opt1']), 'opt1')).toBe(true);
    expect(evaluateCondition(condition('not_equals', ['opt1']), 'opt1')).toBe(
      false,
    );
  });

  it('compares object answers by content', () => {
    const file = { name: 'a.pdf', url: '/a' };
    expect(evaluateCondition(condition('equals', { ...file }), file)).toBe(
      true,
    );
    expect(
      evaluateCondition(condition('not_equals', [{ ...file }]), [file]),
    ).toBe(false);
  });

  it('treats a cleared multi-select as no answer', () => {
    expect(evaluateCondition(condition('not_equals', ['none']), [])).toBe(
      false,
    );
    expect(evaluateCondition(condition('not_in', ['none']), [])).toBe(false);
    expect(evaluateCondition(condition('is_empty', null), [])).toBe(true);
  });

  it('treats a missing answer as not meeting the condition', () => {
    expect(evaluateCondition(condition('not_equals', ['a']), undefined)).toBe(
      false,
    );
    expect(evaluateCondition(condition('not_in', ['a']), null)).toBe(false);
  });

  it('hides a question for not_in when the excluded option is selected', () => {
    expect(evaluateCondition(condition('not_in', ['none']), ['none'])).toBe(
      false,
    );
    expect(evaluateCondition(condition('not_in', ['none']), ['health'])).toBe(
      true,
    );
  });
});

describe('evaluateQuestionVisibility', () => {
  const fields = { Parent: 'parent' };

  it('shows a question without dependencies', () => {
    expect(evaluateQuestionVisibility(null, fields, {})).toBe(true);
  });

  it('hides a question whose multi-select not_equals dependency is unmet', () => {
    const depInfo = {
      logic: 'and' as const,
      conditions: [condition('not_equals', ['none'])],
    };
    expect(
      evaluateQuestionVisibility(depInfo, fields, { parent: ['none'] }),
    ).toBe(false);
    expect(
      evaluateQuestionVisibility(depInfo, fields, { parent: ['health'] }),
    ).toBe(true);
  });
});

describe('getVisibleQuestions', () => {
  const dependsOn = (
    question_description: string,
    required_value: unknown,
  ) => ({
    logic: 'and' as const,
    conditions: [{ question_description, operator: 'equals', required_value }],
  });
  const questions = [
    { description: 'Gate' },
    { description: 'Middle', dependencies_info: dependsOn('Gate', true) },
    { description: 'Nested', dependencies_info: dependsOn('Middle', 'yes') },
  ];
  const fields = { Gate: 'gate', Middle: 'middle', Nested: 'nested' };
  const visible = (values: Record<string, unknown>) =>
    getVisibleQuestions(questions, fields, values).map((q) => q.description);

  it('shows a question whose parent is shown and answered to match', () => {
    expect(visible({ gate: true, middle: 'yes' })).toEqual([
      'Gate',
      'Middle',
      'Nested',
    ]);
  });

  it('hides a question under a hidden parent despite its kept answer', () => {
    expect(visible({ gate: false, middle: 'yes' })).toEqual(['Gate']);
  });
});
