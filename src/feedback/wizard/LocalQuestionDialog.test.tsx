import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { ModalShell } from '@/modal/ModalShell';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';

import { LocalQuestionDialog } from './LocalQuestionDialog';
import { LocalQuestion } from './types';

// The tabs local mode hides are off by flag today; turned on here so the
// test proves local mode hides them, not the flags.
vi.mock('@/marketplace-checklist/utils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/marketplace-checklist/utils')>();
  return {
    ...actual,
    CHECKLIST_FLAGS: {
      ...actual.CHECKLIST_FLAGS,
      questionFormUserGuidance: true,
      questionFormVisibility: true,
      questionFormTriggers: true,
    },
  };
});

const sibling: LocalQuestion = {
  key: 'q-sibling',
  description: 'Do you use the portal?',
  question_type: 'boolean',
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

const outerSubmit = vi.fn();
const outerHide = vi.fn();
const onSave = vi.fn();
const onHide = vi.fn();

// As the wizard will: the question dialog sits inside an open modal and
// inside that modal's <form>.
const renderDialog = (
  siblings: LocalQuestion[] = [sibling],
  question?: LocalQuestion,
) =>
  renderWithProviders(
    <ModalShell open onHide={outerHide}>
      <Form
        onSubmit={outerSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <LocalQuestionDialog
              question={question}
              siblings={siblings}
              onSave={onSave}
              onHide={onHide}
            />
          </form>
        )}
      />
    </ModalShell>,
  );

const expectNoApiCalls = () => {
  for (const [name, fn] of Object.entries(sdk)) {
    if (name.startsWith('checklistsAdmin') && vi.isMockFunction(fn)) {
      expect(fn, name).not.toHaveBeenCalled();
    }
  }
  expect(useModal().closeDialog).not.toHaveBeenCalled();
};

describe('LocalQuestionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hands the question to onSave instead of the API', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(
      screen.getByPlaceholderText('Type your question here...'),
      'Would you recommend us?',
    );
    await openAndSelectOption(user, 'Question type', 'Boolean');
    await user.click(screen.getByRole('tab', { name: 'Visibility' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.any(String),
        description: 'Would you recommend us?',
        question_type: 'boolean',
        options: [],
        conditions: [],
      }),
    );
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(outerSubmit).not.toHaveBeenCalled();
    expect(outerHide).not.toHaveBeenCalled();
    expectNoApiCalls();
  });

  it('gives an option added after a deletion a key of its own', async () => {
    const select: LocalQuestion = {
      ...sibling,
      key: 'q-select',
      description: 'Which portal?',
      question_type: 'single_select',
      options: [
        { key: 'o-old', label: 'Old' },
        { key: 'o-new', label: 'New' },
      ],
    };
    const user = userEvent.setup();
    renderDialog([sibling], select);

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    await user.click(screen.getByRole('button', { name: 'Add answer' }));
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[inputs.length - 1], 'Newest');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const { options } = onSave.mock.calls[0][0] as LocalQuestion;
    expect(options.map((o) => o.label)).toEqual(['New', 'Newest']);
    expect(options[0].key).toBe('o-new');
    // Taking the deleted option's key would point its conditions here.
    expect(['o-old', 'o-new']).not.toContain(options[1].key);
  });

  it('closes only itself on Escape', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByPlaceholderText('Type your question here...'));
    await user.keyboard('{Escape}');

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(outerHide).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(outerSubmit).not.toHaveBeenCalled();
  });

  it('closes only itself on Cancel', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(outerHide).not.toHaveBeenCalled();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('shows only the General and Visibility tabs, without the order field', () => {
    renderDialog();

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'General',
      'Visibility',
    ]);
    expect(screen.queryByText('Question order')).not.toBeInTheDocument();
  });

  it('offers no file question types', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      within(getSelectByLabel('Question type')).getByRole('combobox'),
    );

    expect(
      await screen.findByRole('option', { name: 'Boolean' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'File' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Multiple files' }),
    ).not.toBeInTheDocument();
  });

  it('lists the siblings in the visibility tab without fetching', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('tab', { name: 'Visibility' }));
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.click(screen.getByLabelText('Depends on question'));

    expect(
      await screen.findByRole('option', { name: 'Do you use the portal?' }),
    ).toBeInTheDocument();
    expectNoApiCalls();
  });

  it('explains an empty visibility tab without offering a refresh', async () => {
    const user = userEvent.setup();
    renderDialog([]);

    await user.click(screen.getByRole('tab', { name: 'Visibility' }));

    expect(
      screen.getByText('There are no other questions yet'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Refresh' }),
    ).not.toBeInTheDocument();
    expectNoApiCalls();
  });
});
