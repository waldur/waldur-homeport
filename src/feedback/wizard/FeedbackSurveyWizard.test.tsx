import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  feedbackRequestsCount,
  FeedbackSurvey,
  feedbackSurveysCreate,
  feedbackSurveysList,
  feedbackSurveysRetrieve,
  feedbackSurveysUpdate,
  SurveyQuestion,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { FeedbackSurveyWizard, serializeSurvey } from './FeedbackSurveyWizard';
import { LocalQuestion, SurveyWizardValues } from './types';

// The real picker needs a calendar driver; the wizard only cares about the
// value the field hands to the form.
vi.mock('../../../packages/form/src/DateTimeField', () => ({
  DateTimeField: ({ input }) => (
    <input
      aria-label={input.name}
      value={input.value || ''}
      onChange={(event) => input.onChange(event.target.value)}
    />
  ),
}));

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
  description: 'Which portal do you use?',
  question_type: 'single_select',
  required: true,
  options: [
    { key: 'o-old', label: 'The old one' },
    { key: 'o-new', label: 'The new one' },
  ],
};

const dependant: LocalQuestion = {
  ...base,
  key: 'q-dependant',
  description: 'Why the old one?',
  question_type: 'text_area',
  conditions: [
    {
      depends_on: 'q-parent',
      operator: 'in',
      required_answer_value: ['o-old'],
    },
  ],
};

const values: SurveyWizardValues & { copy_questions_from?: unknown } = {
  name: 'Portal survey',
  intro: undefined,
  questions: [parent, dependant],
  starts_at: '2026-12-01T00:00:00.000+02:00',
  ends_at: '2026-12-31T00:00:00.000+02:00',
  is_active: true,
  max_prompts: 3,
  snooze_days: 5,
  all_users: false,
  customers: [{ uuid: 'c-1', name: 'Org' }],
  offerings: [],
  copy_questions_from: { uuid: 'survey-1' },
};

const survey = {
  uuid: 'survey-9',
  name: 'Autumn survey',
  intro: 'Hello',
  starts_at: '2026-09-01T00:00:00.000+03:00',
  ends_at: '2026-09-30T00:00:00.000+03:00',
  is_active: true,
  is_open: false,
  max_prompts: 2,
  snooze_days: 4,
  audience: { all_users: true, customers: [], offerings: [] },
} as FeedbackSurvey;

// What the API takes for these two, and what it dumps back: only the fields
// common to every type, plus the options of a select question.
const common = {
  required: false,
  user_guidance: '',
  dependency_logic_operator: 'and' as const,
};

const parentRequest = {
  ...common,
  key: 'q-parent',
  description: 'Which portal do you use?',
  question_type: 'single_select' as const,
  required: true,
  options: parent.options,
  conditions: [],
};

const dependantRequest = {
  ...common,
  key: 'q-dependant',
  description: 'Why the old one?',
  question_type: 'text_area' as const,
  conditions: dependant.conditions,
};

const retrievedQuestions: SurveyQuestion[] = [
  parentRequest,
  { ...dependantRequest, options: [] },
];

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

const refetch = vi.fn();

const submitButton = () => screen.getByTestId('wizard-submit-btn');

const next = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => expect(submitButton()).toBeEnabled());
  await user.click(submitButton());
};

const mockEdit = (promptedCount: number) => {
  vi.mocked(feedbackSurveysRetrieve).mockResolvedValue({
    data: { ...survey, questions: retrievedQuestions },
  } as any);
  vi.mocked(feedbackRequestsCount).mockResolvedValue(
    mockListResponse([], promptedCount),
  );
};

// Walks the steps of a survey whose fields are already filled in.
const walkToReview = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByDisplayValue('Autumn survey');
  await next(user);
  await screen.findByRole('row', { name: /Why the old one\?/ });
  await next(user);
  await screen.findByLabelText('starts_at');
  await next(user);
  await waitFor(() =>
    expect(screen.queryByLabelText('starts_at')).not.toBeInTheDocument(),
  );
};

describe('serializeSurvey', () => {
  it('sends the questions and only the API fields', () => {
    expect(serializeSurvey(values, false)).toEqual({
      name: 'Portal survey',
      intro: '',
      starts_at: '2026-12-01T00:00:00.000+02:00',
      ends_at: '2026-12-31T00:00:00.000+02:00',
      is_active: true,
      max_prompts: 3,
      snooze_days: 5,
      audience_query: { all_users: false, customers: ['c-1'], offerings: [] },
      questions: [parentRequest, dependantRequest],
    });
  });

  it('leaves the questions out of a locked survey', () => {
    expect(serializeSurvey(values, true)).not.toHaveProperty('questions');
  });
});

describe('FeedbackSurveyWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(feedbackSurveysCreate).mockResolvedValue({ data: {} } as any);
    vi.mocked(feedbackSurveysUpdate).mockResolvedValue({ data: {} } as any);
  });

  it('creates a survey with its questions after walking every step', async () => {
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
      data: { uuid: 'survey-1', questions: retrievedQuestions },
    } as any);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ refetch }} />);

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Audience & schedule')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Name/), 'Portal survey');
    await user.type(screen.getByTestId('markdown-editor'), 'Hi');
    await next(user);

    await openAndSelectOption(
      user,
      'Copy questions from another survey',
      'Spring survey',
    );
    await screen.findByRole('row', { name: /Why the old one\?/ });
    await next(user);

    await user.type(screen.getByLabelText('starts_at'), '2026-12-01');
    await user.type(screen.getByLabelText('ends_at'), '2026-12-31');
    await user.click(screen.getByLabelText('Ask all users'));
    await next(user);

    expect(submitButton()).toHaveTextContent('Create');
    await user.click(submitButton());

    await waitFor(() => expect(feedbackSurveysCreate).toHaveBeenCalled());
    const { body } = vi.mocked(feedbackSurveysCreate).mock.calls[0][0];
    expect(body).toMatchObject({
      name: 'Portal survey',
      intro: 'Hi',
      starts_at: '2026-12-01',
      ends_at: '2026-12-31',
      is_active: true,
      max_prompts: 3,
      snooze_days: 3,
      audience_query: { all_users: true, customers: [], offerings: [] },
    });
    expect(body).not.toHaveProperty('checklist');
    expect(body).not.toHaveProperty('copy_questions_from');
    const [copiedParent, copiedDependant] = body.questions;
    expect(copiedParent).toMatchObject({
      description: 'Which portal do you use?',
      question_type: 'single_select',
      required: true,
      options: [
        { key: expect.any(String), label: 'The old one' },
        { key: expect.any(String), label: 'The new one' },
      ],
    });
    expect(copiedParent.key).not.toBe('q-parent');
    for (const question of body.questions) {
      for (const key of TYPE_ONLY_KEYS) {
        expect(question).not.toHaveProperty(key);
      }
    }
    expect(copiedDependant).not.toHaveProperty('options');
    expect(copiedDependant.conditions).toEqual([
      {
        depends_on: copiedParent.key,
        operator: 'in',
        required_answer_value: [copiedParent.options[0].key],
      },
    ]);
  });

  it('continues from the details with only a name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ refetch }} />);

    expect(submitButton()).toBeDisabled();
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText('Fill in the required fields.').length,
      ).toBeGreaterThan(0),
    );

    await user.type(screen.getByLabelText(/Name/), 'Portal survey');
    await waitFor(() => expect(submitButton()).toBeEnabled());
  });

  it('names the missing audience on the audience step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ refetch }} />);

    await user.type(screen.getByLabelText(/Name/), 'Portal survey');
    await next(user);
    // Copying is the quickest way to a question without the question dialog.
    vi.mocked(feedbackSurveysList).mockResolvedValue({
      data: [{ uuid: 'survey-1', name: 'Spring survey' }],
      response: { headers: new Headers({ 'x-result-count': '1' }) },
    } as any);
    vi.mocked(feedbackSurveysRetrieve).mockResolvedValue({
      data: { uuid: 'survey-1', questions: retrievedQuestions },
    } as any);
    await openAndSelectOption(
      user,
      'Copy questions from another survey',
      'Spring survey',
    );
    await screen.findByRole('row', { name: /Why the old one\?/ });
    await next(user);

    expect(submitButton()).toBeDisabled();
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText(
          'Fill in the required fields. Choose all users, organizations or offerings.',
        ).length,
      ).toBeGreaterThan(0),
    );

    await user.type(screen.getByLabelText('starts_at'), '2026-12-01');
    await user.type(screen.getByLabelText('ends_at'), '2026-12-31');
    await user.unhover(submitButton());
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText('Choose all users, organizations or offerings.')
          .length,
      ).toBeGreaterThan(0),
    );
    expect(submitButton()).toBeDisabled();

    await user.click(screen.getByLabelText('Ask all users'));
    await waitFor(() => expect(submitButton()).toBeEnabled());
  });

  it('lists the retrieved questions and sends them on save', async () => {
    mockEdit(0);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await walkToReview(user);
    expect(feedbackSurveysRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'survey-9' },
    });
    expect(submitButton()).toHaveTextContent('Save');
    await user.click(submitButton());

    await waitFor(() => expect(feedbackSurveysUpdate).toHaveBeenCalled());
    const call = vi.mocked(feedbackSurveysUpdate).mock.calls[0][0];
    expect(call.path).toEqual({ uuid: 'survey-9' });
    expect(call.body).toMatchObject({
      name: 'Autumn survey',
      intro: 'Hello',
      max_prompts: 2,
      snooze_days: 4,
      audience_query: { all_users: true, customers: [], offerings: [] },
    });
    // An unchanged question set goes back exactly as the API dumped it.
    expect(call.body.questions).toEqual([parentRequest, dependantRequest]);
    expect(call.body).not.toHaveProperty('checklist');
  });

  it('leaves the questions out when users have been prompted', async () => {
    mockEdit(2);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await screen.findByDisplayValue('Autumn survey');
    await next(user);
    expect(
      await screen.findByText(
        "Users have been prompted, so the questionnaire can't be changed.",
      ),
    ).toBeInTheDocument();
    await next(user);
    await screen.findByLabelText('starts_at');
    await next(user);
    await waitFor(() =>
      expect(screen.queryByLabelText('starts_at')).not.toBeInTheDocument(),
    );
    await user.click(submitButton());

    await waitFor(() => expect(feedbackSurveysUpdate).toHaveBeenCalled());
    const { body } = vi.mocked(feedbackSurveysUpdate).mock.calls[0][0];
    expect(body).toMatchObject({ name: 'Autumn survey' });
    expect(body).not.toHaveProperty('questions');
  });

  it('stays open and reports a refused save', async () => {
    mockEdit(0);
    // Someone was prompted after the wizard read the count, so the backend
    // locks the questions the wizard still sends.
    const error = {
      questions: [
        "The questionnaire can't be changed once users have been prompted.",
      ],
      status: 400,
      statusText: '',
      response: {},
    };
    vi.mocked(feedbackSurveysUpdate).mockRejectedValue(error);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await walkToReview(user);
    await user.click(submitButton());

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update survey.',
      ),
    );
    expect(useModal().closeDialog).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
    expect(submitButton()).toHaveTextContent('Save');
  });

  it('reviews the details and the questions', async () => {
    mockEdit(0);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await walkToReview(user);

    expect(screen.getByText('Autumn survey')).toBeInTheDocument();
    expect(screen.getByText(/^Ask all users/)).toBeInTheDocument();
    expect(screen.getByText(/^Snooze days/)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /Which portal do you use\?/ });
    expect(within(row).getByText('Single select')).toBeInTheDocument();
    expect(within(row).getByText('Yes')).toBeInTheDocument();
    expect(
      screen.getByRole('row', { name: /Why the old one\?/ }),
    ).toBeInTheDocument();
  });

  it('refuses to save an audience emptied after the review was reached', async () => {
    mockEdit(0);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await walkToReview(user);
    await user.click(screen.getByTestId('wizard-back-btn'));
    await user.click(await screen.findByLabelText('Ask all users'));
    await waitFor(() => expect(submitButton()).toBeDisabled());
    await user.click(screen.getByTestId('wizard-back-btn'));
    await screen.findByRole('row', { name: /Why the old one\?/ });
    await user.click(
      within(screen.getByRole('group', { name: 'Form progress' })).getByRole(
        'button',
        { name: /Review/ },
      ),
    );
    await waitFor(() => expect(submitButton()).toHaveTextContent('Save'));

    expect(submitButton()).toBeDisabled();
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText('Choose all users, organizations or offerings.')
          .length,
      ).toBeGreaterThan(0),
    );
    await user.click(submitButton());
    expect(feedbackSurveysUpdate).not.toHaveBeenCalled();
  });

  it('refuses an unlocked survey left without questions', async () => {
    mockEdit(0);
    const user = userEvent.setup();
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    await walkToReview(user);
    await user.click(screen.getByTestId('wizard-back-btn'));
    await user.click(screen.getByTestId('wizard-back-btn'));
    for (const text of ['Why the old one\\?', 'Which portal do you use\\?']) {
      const row = await screen.findByRole('row', { name: new RegExp(text) });
      await user.click(within(row).getByRole('button', { name: 'Actions' }));
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    }
    await waitFor(() => expect(submitButton()).toBeDisabled());
    // The step bar can't leave the Questions step now, but it can from Details.
    await user.click(screen.getByTestId('wizard-back-btn'));
    await screen.findByDisplayValue('Autumn survey');
    await user.click(
      within(screen.getByRole('group', { name: 'Form progress' })).getByRole(
        'button',
        { name: /Review/ },
      ),
    );

    await waitFor(() => expect(submitButton()).toHaveTextContent('Save'));
    expect(submitButton()).toBeDisabled();
    await user.hover(submitButton());
    await waitFor(() =>
      expect(
        screen.getAllByText('Add at least one question.').length,
      ).toBeGreaterThan(0),
    );
  });

  it('does not open a survey whose prompted count cannot be read', async () => {
    vi.mocked(feedbackSurveysRetrieve).mockResolvedValue({
      data: { ...survey, questions: retrievedQuestions },
    } as any);
    vi.mocked(feedbackRequestsCount).mockRejectedValue(new Error('nope'));
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    expect(
      await screen.findByRole('button', { name: 'Reload' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('wizard-submit-btn')).not.toBeInTheDocument();
  });

  it('offers a reload when the survey cannot be loaded', async () => {
    vi.mocked(feedbackSurveysRetrieve).mockRejectedValue(new Error('nope'));
    vi.mocked(feedbackRequestsCount).mockResolvedValue(mockListResponse([], 0));
    renderWithProviders(<FeedbackSurveyWizard resolve={{ survey, refetch }} />);

    expect(
      await screen.findByRole('button', { name: 'Reload' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('wizard-submit-btn')).not.toBeInTheDocument();
  });
});
