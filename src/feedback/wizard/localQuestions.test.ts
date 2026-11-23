import { describe, expect, it } from 'vitest';
import { SurveyQuestion } from 'waldur-js-client';

import {
  copyQuestions,
  duplicateDescriptions,
  fromQuestionFormValues,
  fromSurveyQuestion,
  moveQuestion,
  pruneStaleConditions,
  removeQuestion,
  getTypeLabel,
  toQuestionFormValues,
  toSurveyQuestionRequest,
  toVisibilityQuestions,
} from './localQuestions';
import { LocalQuestion } from './types';

const base: Omit<LocalQuestion, 'key' | 'description' | 'question_type'> = {
  required: false,
  user_guidance: '',
  min_value: null,
  max_value: null,
  likert_scale_length: null,
  likert_low_label: '',
  likert_high_label: '',
  likert_allow_na: false,
  rich_text_char_limit: null,
  rich_text_toolbar_level: 'standard',
  dependency_logic_operator: 'and',
  options: [],
  conditions: [],
};

const select: LocalQuestion = {
  ...base,
  key: 'q-select',
  description: 'Which services do you use?',
  question_type: 'multi_select',
  required: true,
  user_guidance: 'Pick all that apply',
  dependency_logic_operator: 'or',
  options: [
    { key: 'o-1', label: 'Compute' },
    { key: 'o-2', label: 'Storage' },
  ],
  conditions: [
    {
      depends_on: 'q-boolean',
      operator: 'equals',
      required_answer_value: true,
    },
    {
      depends_on: 'q-single',
      operator: 'in',
      required_answer_value: ['o-9'],
    },
  ],
};

const fixtures: LocalQuestion[] = [
  select,
  {
    ...base,
    key: 'q-likert',
    description: 'How satisfied are you?',
    question_type: 'likert',
    likert_scale_length: 7,
    likert_low_label: 'Not at all',
    likert_high_label: 'Very',
    likert_allow_na: true,
  },
  {
    ...base,
    key: 'q-rich',
    description: 'Tell us more',
    question_type: 'rich_text',
    rich_text_char_limit: 500,
    rich_text_toolbar_level: 'minimal',
  },
  {
    ...base,
    key: 'q-number',
    description: 'How many projects?',
    question_type: 'number',
    min_value: '1',
    max_value: '10',
  },
];

describe('localQuestions', () => {
  it.each(fixtures)('round-trips a $question_type question', (question) => {
    expect(
      fromQuestionFormValues(toQuestionFormValues(question), question),
    ).toEqual(question);
  });

  it('maps conditions to the form field the visibility tab edits', () => {
    expect(toQuestionFormValues(select).conditions[0]).toEqual({
      depends_on_question: 'q-boolean',
      operator: 'equals',
      required_answer_value: true,
    });
  });

  it('keeps the key of a renamed option', () => {
    const values = toQuestionFormValues(select);
    values.options[0] = 'Cloud compute';

    expect(fromQuestionFormValues(values, select).options[0]).toEqual({
      key: 'o-1',
      label: 'Cloud compute',
    });
  });

  it('gives a new option a new key', () => {
    const values = toQuestionFormValues(select);
    values.options.push('Networking');

    const { options } = fromQuestionFormValues(values, select);

    expect(options[2].label).toBe('Networking');
    expect(options[2].key).toEqual(expect.any(String));
    expect(['o-1', 'o-2']).not.toContain(options[2].key);
  });

  it('gives a new question a key of its own', () => {
    const values = toQuestionFormValues(select);

    expect(fromQuestionFormValues(values).key).not.toBe(select.key);
  });

  it('drops the fields of other question types', () => {
    const values = {
      ...toQuestionFormValues(select),
      question_type: 'text_input' as const,
    };

    expect(fromQuestionFormValues(values, select).options).toEqual([]);
  });

  it('defaults the logic operator when the visibility tab was not opened', () => {
    const values = toQuestionFormValues(fixtures[1]);
    delete values.dependency_logic_operator;

    expect(fromQuestionFormValues(values).dependency_logic_operator).toBe(
      'and',
    );
  });

  it('lists the other questions for the visibility tab, keyed by key', () => {
    const boolean: LocalQuestion = {
      ...base,
      key: 'q-boolean',
      description: 'Do you use the portal?',
      question_type: 'boolean',
    };

    // Without its own conditions: one on the edited question would be left
    // out, as a cycle (see below).
    const unconditional = { ...select, conditions: [] };
    expect(
      toVisibilityQuestions([unconditional, boolean], 'q-boolean'),
    ).toEqual([
      {
        uuid: 'q-select',
        url: 'q-select',
        description: 'Which services do you use?',
        question_type: 'multi_select',
        question_options: [
          { uuid: 'o-1', label: 'Compute' },
          { uuid: 'o-2', label: 'Storage' },
        ],
      },
    ]);
  });
});

const boolean: LocalQuestion = {
  ...base,
  key: 'q-boolean',
  description: 'Do you use the portal?',
  question_type: 'boolean',
};

const single: LocalQuestion = {
  ...base,
  key: 'q-single',
  description: 'Which portal?',
  question_type: 'single_select',
  options: [
    { key: 'o-8', label: 'Old' },
    { key: 'o-9', label: 'New' },
  ],
};

const resolves = (questions: LocalQuestion[]) =>
  questions.every((question) =>
    question.conditions.every((condition) => {
      const parent = questions.find((q) => q.key === condition.depends_on);
      if (!parent) return false;
      if (!parent.options.length) return true;
      const keys = parent.options.map((option) => option.key);
      return [condition.required_answer_value]
        .flat()
        .every((value) => keys.includes(value as string));
    }),
  );

describe('question list helpers', () => {
  it('drops the conditions of dependants with the question', () => {
    const result = removeQuestion([boolean, single, select], 'q-boolean');

    expect(result.map((q) => q.key)).toEqual(['q-single', 'q-select']);
    expect(result[1].conditions).toEqual([select.conditions[1]]);
  });

  it('moves a question to another position', () => {
    expect(
      moveQuestion([boolean, single, select], 0, 2).map((q) => q.key),
    ).toEqual(['q-single', 'q-select', 'q-boolean']);
  });

  it('gives each copy its own keys, with conditions inside the copy', () => {
    const source = [boolean, single, select];

    const first = copyQuestions([], source).questions;
    const second = copyQuestions([], source).questions;

    const keysOf = (questions: LocalQuestion[]) =>
      questions.flatMap((q) => [q.key, ...q.options.map((o) => o.key)]);
    const all = [...keysOf(source), ...keysOf(first), ...keysOf(second)];
    expect(new Set(all).size).toBe(all.length);
    expect(resolves(first)).toBe(true);
    expect(resolves(second)).toBe(true);
    expect(first[2].conditions[0].required_answer_value).toBe(true);
    expect(first.map((q) => q.description)).toEqual(
      source.map((q) => q.description),
    );
  });

  const dependant: LocalQuestion = {
    ...boolean,
    key: 'q-dependant',
    description: 'Why?',
    conditions: [
      {
        depends_on: 'q-single',
        operator: 'equals',
        required_answer_value: 'o-9',
      },
    ],
  };

  it('remaps a scalar option reference', () => {
    const [copied, copiedDependant] = copyQuestions(
      [],
      [single, dependant],
    ).questions;

    expect(copiedDependant.conditions[0]).toEqual({
      depends_on: copied.key,
      operator: 'equals',
      required_answer_value: copied.options[1].key,
    });
  });

  it('skips the questions whose text is already in the survey', () => {
    const existing = { ...boolean, key: 'q-mine', description: ' Why?' };

    const result = copyQuestions([existing], [single, dependant]);

    expect(result.questions.map((q) => q.description)).toEqual([
      'Which portal?',
    ]);
    expect(result.skipped).toEqual(['Why?']);
  });

  it('points a copied condition at the question already in the survey', () => {
    // Same labels, other keys and order: the option is found by its label.
    const existing: LocalQuestion = {
      ...single,
      key: 'q-mine',
      options: [
        { key: 'm-new', label: 'New' },
        { key: 'm-old', label: 'Old' },
      ],
    };

    const result = copyQuestions([existing], [single, dependant]);

    expect(result.skipped).toEqual(['Which portal?']);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].conditions).toEqual([
      {
        depends_on: 'q-mine',
        operator: 'equals',
        required_answer_value: 'm-new',
      },
    ]);
  });

  it('keeps only the options the question already in the survey has', () => {
    const existing: LocalQuestion = {
      ...single,
      key: 'q-mine',
      options: [{ key: 'm-old', label: 'Old' }],
    };
    const either: LocalQuestion = {
      ...dependant,
      conditions: [
        {
          depends_on: 'q-single',
          operator: 'in',
          required_answer_value: ['o-8', 'o-9'],
        },
      ],
    };

    const [copied] = copyQuestions([existing], [single, either]).questions;

    expect(copied.conditions[0].required_answer_value).toEqual(['m-old']);
    // None of its options left: the condition would mean something else.
    expect(
      copyQuestions(
        [{ ...existing, options: [{ key: 'm-x', label: 'Other' }] }],
        [single, dependant],
      ).questions[0].conditions,
    ).toEqual([]);
  });

  it('drops a condition on a question already there with another type', () => {
    const existing: LocalQuestion = {
      ...boolean,
      key: 'q-mine',
      description: 'Which portal?',
    };

    const [copied] = copyQuestions([existing], [single, dependant]).questions;

    expect(copied.conditions).toEqual([]);
  });

  it('lists each duplicated text once, ignoring outer spaces', () => {
    expect(
      duplicateDescriptions([
        { ...boolean, description: 'A' },
        { ...single, description: ' A' },
        { ...select, description: 'a' },
      ]),
    ).toEqual(['A']);
  });

  // The options the dialog hands back, each with the key the form kept with
  // it through removals and moves; a new option has none.
  const editOptions = (options: Array<[string, string?]>) =>
    fromQuestionFormValues(
      {
        ...toQuestionFormValues(single),
        options: options.map(([label]) => label),
        option_keys: options.map(([, key]) => key),
      },
      single,
    );

  it('takes each option key from the form, and a new one for a new option', () => {
    const { options } = editOptions([['New', 'o-9'], ['Newest']]);

    expect(options[0]).toEqual({ key: 'o-9', label: 'New' });
    expect(options[1].label).toBe('Newest');
    expect(['o-8', 'o-9']).not.toContain(options[1].key);
  });

  it('drops a condition on the deleted first option', () => {
    const dependant: LocalQuestion = {
      ...boolean,
      key: 'q-dependant',
      description: 'Why?',
      conditions: [
        {
          depends_on: 'q-single',
          operator: 'in',
          required_answer_value: ['o-8'],
        },
      ],
    };

    const [, result] = pruneStaleConditions(
      [editOptions([['New', 'o-9']]), dependant],
      single,
    );

    expect(result.conditions).toEqual([]);
  });

  it('drops a condition whose option is gone after an edit', () => {
    const [, result] = pruneStaleConditions(
      [editOptions([['Old', 'o-8']]), select],
      single,
    );

    expect(result.conditions.map((c) => c.depends_on)).toEqual(['q-boolean']);
  });

  it('keeps the options of a condition that are still there', () => {
    const dependant: LocalQuestion = {
      ...boolean,
      key: 'q-dependant',
      description: 'Why?',
      conditions: [
        {
          depends_on: 'q-single',
          operator: 'in',
          required_answer_value: ['o-8', 'o-9'],
        },
      ],
    };
    const [, result] = pruneStaleConditions(
      [editOptions([['New', 'o-9']]), dependant],
      single,
    );

    expect(result.conditions[0].required_answer_value).toEqual(['o-9']);
  });

  it('drops the conditions on a question whose type changed', () => {
    const edited = { ...single, question_type: 'text_input' as const };

    const [, result] = pruneStaleConditions(
      [{ ...edited, options: [] }, select],
      single,
    );

    expect(result.conditions.map((c) => c.depends_on)).toEqual(['q-boolean']);
  });

  it('fills the fields a survey question leaves out', () => {
    const question: SurveyQuestion = {
      key: 'abc',
      description: 'Anything else?',
      question_type: 'text_area',
    };

    expect(fromSurveyQuestion(question)).toEqual({
      ...base,
      key: 'abc',
      description: 'Anything else?',
      question_type: 'text_area',
    });
  });
});

const TYPE_ONLY_KEYS = [
  'min_value',
  'max_value',
  'likert_scale_length',
  'likert_low_label',
  'likert_high_label',
  'likert_allow_na',
  'rich_text_char_limit',
  'rich_text_toolbar_level',
];

describe('toSurveyQuestionRequest', () => {
  it.each(['boolean', 'text_input', 'text_area', 'date', 'email'] as const)(
    'sends no fields of other types for a %s question',
    (question_type) => {
      const request = toSurveyQuestionRequest({
        ...base,
        key: 'q',
        description: 'Q',
        question_type,
      });
      for (const key of TYPE_ONLY_KEYS) {
        expect(request).not.toHaveProperty(key);
      }
      expect(request).not.toHaveProperty('options');
    },
  );

  it('sends the options and the common fields of a select question', () => {
    const request = toSurveyQuestionRequest(select);

    expect(request).toEqual({
      key: 'q-select',
      description: 'Which services do you use?',
      question_type: 'multi_select',
      required: true,
      user_guidance: 'Pick all that apply',
      dependency_logic_operator: 'or',
      options: select.options,
      conditions: select.conditions,
    });
  });

  it.each(['number', 'year', 'rating'] as const)(
    'sends the range of a %s question',
    (question_type) => {
      const request = toSurveyQuestionRequest({
        ...base,
        key: 'q',
        description: 'Q',
        question_type,
        min_value: '1',
        max_value: '10',
      });

      expect(request).toMatchObject({ min_value: '1', max_value: '10' });
      expect(request).not.toHaveProperty('rich_text_toolbar_level');
      expect(request).not.toHaveProperty('likert_scale_length');
    },
  );

  it('sends the likert fields of a likert question', () => {
    const request = toSurveyQuestionRequest({
      ...base,
      key: 'q',
      description: 'Q',
      question_type: 'likert',
      likert_scale_length: 7,
      likert_low_label: 'Low',
      likert_high_label: 'High',
      likert_allow_na: true,
    });

    expect(request).toMatchObject({
      likert_scale_length: 7,
      likert_low_label: 'Low',
      likert_high_label: 'High',
      likert_allow_na: true,
    });
    expect(request).not.toHaveProperty('min_value');
    expect(request).not.toHaveProperty('rich_text_toolbar_level');
  });

  it('sends the rich text fields of a rich text question', () => {
    const request = toSurveyQuestionRequest({
      ...base,
      key: 'q',
      description: 'Q',
      question_type: 'rich_text',
      rich_text_char_limit: 500,
      rich_text_toolbar_level: 'minimal',
    });

    expect(request).toMatchObject({
      rich_text_char_limit: 500,
      rich_text_toolbar_level: 'minimal',
    });
    expect(request).not.toHaveProperty('likert_allow_na');
  });

  it('sends a retrieved question back without the defaults loading added', () => {
    // The shape the backend dumps: no fields of other types.
    const retrieved: SurveyQuestion = {
      key: 'abc',
      description: 'Anything else?',
      question_type: 'text_area',
      required: false,
      user_guidance: '',
      dependency_logic_operator: 'and',
      options: [],
      conditions: [],
    };

    expect(toSurveyQuestionRequest(fromSurveyQuestion(retrieved))).toEqual({
      key: 'abc',
      description: 'Anything else?',
      question_type: 'text_area',
      required: false,
      user_guidance: '',
      dependency_logic_operator: 'and',
      conditions: [],
    });
  });
});

describe('year range', () => {
  it('keeps the min and max of a year question', () => {
    const year: LocalQuestion = {
      ...base,
      key: 'q-year',
      description: 'Since when?',
      question_type: 'year',
      min_value: '1990',
      max_value: '2030',
    };

    expect(fromQuestionFormValues(toQuestionFormValues(year), year)).toEqual(
      year,
    );
  });

  it('labels a question type', () => {
    expect(getTypeLabel('single_select')).toBe('Single select');
  });
});

describe('toVisibilityQuestions cycles', () => {
  it('leaves out questions that already depend on the edited one', () => {
    const a: LocalQuestion = { ...single, key: 'q-a' };
    const b: LocalQuestion = {
      ...boolean,
      key: 'q-b',
      conditions: [
        { depends_on: 'q-a', operator: 'equals', required_answer_value: true },
      ],
    };
    const c: LocalQuestion = {
      ...boolean,
      key: 'q-c',
      conditions: [
        { depends_on: 'q-b', operator: 'equals', required_answer_value: true },
      ],
    };
    const d: LocalQuestion = { ...select, key: 'q-d' };

    expect(
      toVisibilityQuestions([a, b, c, d], 'q-a').map((q) => q.uuid),
    ).toEqual(['q-d']);
  });
});
