import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  feedbackSurveysList,
  feedbackSurveysRetrieve,
  SurveyQuestion,
} from 'waldur-js-client';

import { Wizard } from 'waldur-wizard';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { QuestionsStep } from './QuestionsStep';
import { LocalQuestion, SurveyWizardValues } from './types';

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

const parent: LocalQuestion = {
  ...base,
  key: 'q-parent',
  description: 'Do you use the portal?',
  question_type: 'boolean',
};

const dependant: LocalQuestion = {
  ...base,
  key: 'q-dependant',
  description: 'What do you like about it?',
  question_type: 'text_area',
  conditions: [
    {
      depends_on: 'q-parent',
      operator: 'equals',
      required_answer_value: true,
    },
  ],
};

const onSubmit = vi.fn();

const renderStep = (
  questions: LocalQuestion[],
  locked = false,
  surveyUuid?: string,
) =>
  renderWithProviders(
    <Wizard
      title="Create survey"
      steps={[{ key: 'questions', label: 'Questions', completed: false }]}
      wizardForms={[QuestionsStep]}
      initialValues={{ questions }}
      data={{ locked, surveyUuid }}
      onSubmit={onSubmit}
      submitLabel="Create"
    />,
  );

const submitButton = () => screen.getByTestId('wizard-submit-btn');

const submittedValues = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(submitButton());
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  return onSubmit.mock.calls[0][0] as SurveyWizardValues;
};

const rowActions = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) => {
  const row = screen.getByRole('row', { name: new RegExp(text) });
  await user.click(within(row).getByRole('button', { name: 'Actions' }));
};

describe('QuestionsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('needs a question to continue', async () => {
    const user = userEvent.setup();
    renderStep([]);

    expect(submitButton()).toBeDisabled();
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText('Add at least one question.').length,
      ).toBeGreaterThan(0),
    );
  });

  it('lists a question added through the dialog', async () => {
    const user = userEvent.setup();
    renderStep([]);

    await user.click(screen.getByRole('button', { name: 'Add question' }));
    await user.type(
      screen.getByPlaceholderText('Type your question here...'),
      'Would you recommend us?',
    );
    await openAndSelectOption(user, 'Question type', 'Boolean');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(
      screen.getByRole('row', { name: /Would you recommend us\?/ }),
    ).toBeInTheDocument();
    const values = await submittedValues(user);
    expect(values.questions).toEqual([
      expect.objectContaining({
        description: 'Would you recommend us?',
        question_type: 'boolean',
      }),
    ]);
  });

  it('asks before deleting a question others depend on, then drops their conditions', async () => {
    const user = userEvent.setup();
    renderStep([parent, dependant]);

    await rowActions(user, 'Do you use the portal\\?');
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(useModal().confirm).toHaveBeenCalledTimes(1);
    const values = await submittedValues(user);
    expect(values.questions).toEqual([{ ...dependant, conditions: [] }]);
  });

  it('keeps the list when the delete is not confirmed', async () => {
    vi.mocked(useModal().confirm).mockRejectedValueOnce(undefined);
    const user = userEvent.setup();
    renderStep([parent, dependant]);

    await rowActions(user, 'Do you use the portal\\?');
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    const values = await submittedValues(user);
    expect(values.questions).toEqual([parent, dependant]);
  });

  it('edits a question in place and drops conditions its new type breaks', async () => {
    const user = userEvent.setup();
    renderStep([parent, dependant]);

    await rowActions(user, 'Do you use the portal\\?');
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    await openAndSelectOption(user, 'Question type', 'Text input');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const values = await submittedValues(user);
    expect(values.questions.map((q) => q.key)).toEqual([
      'q-parent',
      'q-dependant',
    ]);
    expect(values.questions[0].question_type).toBe('text_input');
    expect(values.questions[1].conditions).toEqual([]);
    // The dropped condition is reported, as deleting the question would be.
    expect(useNotify().showInfo).toHaveBeenCalledWith(
      expect.stringContaining(dependant.description),
    );
  });

  it('deletes a question nobody depends on without asking', async () => {
    const user = userEvent.setup();
    renderStep([parent, dependant]);

    await rowActions(user, 'What do you like about it\\?');
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(useModal().confirm).not.toHaveBeenCalled();
    const values = await submittedValues(user);
    expect(values.questions).toEqual([parent]);
  });

  it('moves a question down', async () => {
    const user = userEvent.setup();
    renderStep([parent, dependant]);

    await rowActions(user, 'Do you use the portal\\?');
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }));

    const values = await submittedValues(user);
    expect(values.questions.map((q) => q.key)).toEqual([
      'q-dependant',
      'q-parent',
    ]);
  });

  it('appends the questions of another survey with keys of their own', async () => {
    const source: SurveyQuestion[] = [
      {
        key: 'aaa',
        description: 'Which portal do you use?',
        question_type: 'single_select',
        options: [
          { key: 'o-old', label: 'Old' },
          { key: 'o-new', label: 'New' },
        ],
      },
      {
        key: 'bbb',
        description: 'Why the old one?',
        question_type: 'text_area',
        conditions: [
          {
            depends_on: 'aaa',
            operator: 'in',
            required_answer_value: ['o-old'],
          },
        ],
      },
    ];
    vi.mocked(feedbackSurveysList).mockResolvedValue({
      data: [
        {
          uuid: 'survey-1',
          name: 'Spring survey',
          starts_at: '2026-03-01T00:00:00Z',
        },
      ],
      response: { headers: new Headers({ 'x-result-count': '1' }) },
    } as any);
    vi.mocked(feedbackSurveysRetrieve).mockResolvedValue({
      data: { uuid: 'survey-1', questions: source },
    } as any);
    const user = userEvent.setup();
    renderStep([parent]);

    await openAndSelectOption(
      user,
      'Copy questions from another survey',
      'Spring survey',
    );

    expect(
      await screen.findByRole('row', { name: /Why the old one\?/ }),
    ).toBeInTheDocument();
    expect(feedbackSurveysRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'survey-1' },
    });
    const values = await submittedValues(user);
    const [, copiedParent, copiedDependant] = values.questions;
    expect(values.questions.map((q) => q.description)).toEqual([
      'Do you use the portal?',
      'Which portal do you use?',
      'Why the old one?',
    ]);
    expect(copiedParent.key).not.toBe('aaa');
    expect(copiedParent.options.map((o) => o.key)).not.toContain('o-old');
    expect(copiedDependant.conditions).toEqual([
      {
        depends_on: copiedParent.key,
        operator: 'in',
        required_answer_value: [copiedParent.options[0].key],
      },
    ]);
    expect(values).not.toHaveProperty('copy_questions_from');
  });

  it('skips copied questions whose text is already there', async () => {
    vi.mocked(feedbackSurveysList).mockResolvedValue({
      data: [
        {
          uuid: 'survey-1',
          name: 'Spring survey',
          starts_at: '2026-03-01T00:00:00Z',
        },
      ],
      response: { headers: new Headers({ 'x-result-count': '1' }) },
    } as any);
    vi.mocked(feedbackSurveysRetrieve).mockResolvedValue({
      data: {
        uuid: 'survey-1',
        questions: [
          {
            key: 'aaa',
            description: 'Do you use the portal?',
            question_type: 'boolean',
          },
          {
            key: 'bbb',
            description: 'Why not?',
            question_type: 'text_area',
            conditions: [
              {
                depends_on: 'aaa',
                operator: 'equals',
                required_answer_value: false,
              },
            ],
          },
        ] as SurveyQuestion[],
      },
    } as any);
    const user = userEvent.setup();
    renderStep([parent]);

    await openAndSelectOption(
      user,
      'Copy questions from another survey',
      'Spring survey',
    );

    expect(
      await screen.findByRole('row', { name: /Why not\?/ }),
    ).toBeInTheDocument();
    expect(useNotify().showInfo).toHaveBeenCalledWith(
      'Already in this survey, so not copied: Do you use the portal?',
    );
    const values = await submittedValues(user);
    expect(values.questions.map((q) => q.description)).toEqual([
      'Do you use the portal?',
      'Why not?',
    ]);
    expect(values.questions[1].conditions).toEqual([
      {
        depends_on: 'q-parent',
        operator: 'equals',
        required_answer_value: false,
      },
    ]);
  });

  it('leaves the survey being edited out of the copy picker', async () => {
    vi.mocked(feedbackSurveysList).mockResolvedValue({
      data: [
        { uuid: 'survey-1', name: 'Spring survey', starts_at: '2026-03-01' },
        { uuid: 'survey-2', name: 'This survey', starts_at: '2026-04-01' },
      ],
      response: { headers: new Headers({ 'x-result-count': '2' }) },
    } as any);
    const user = userEvent.setup();
    renderStep([parent], false, 'survey-2');

    await user.click(
      screen.getByLabelText('Copy questions from another survey'),
    );

    expect(await screen.findByText(/Spring survey/)).toBeInTheDocument();
    expect(screen.queryByText(/This survey/)).not.toBeInTheDocument();
  });

  it('refuses two questions with one text', async () => {
    const user = userEvent.setup();
    renderStep([
      parent,
      { ...dependant, description: ' Do you use the portal?' },
    ]);

    expect(
      screen.getByText(
        'Two questions have the same text: Do you use the portal?',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Change or delete one of them.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the questions of a locked survey read-only', async () => {
    const user = userEvent.setup();
    renderStep([parent, dependant], true);

    expect(
      screen.getByText(
        "Users have been prompted, so the questionnaire can't be changed.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', { name: /Do you use the portal\?/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Actions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add question' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Copy questions from another survey'),
    ).not.toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
    await submittedValues(user);
  });

  // An old questionnaire may hold them, and a locked one can't be fixed here.
  it('lets a locked survey with one text twice continue', async () => {
    const user = userEvent.setup();
    renderStep(
      [parent, { ...dependant, description: parent.description }],
      true,
    );

    expect(
      screen.queryByText('Each question needs its own text.'),
    ).not.toBeInTheDocument();
    await submittedValues(user);
  });
});
