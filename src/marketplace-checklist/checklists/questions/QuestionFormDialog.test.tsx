import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { QuestionFormDialog } from './QuestionFormDialog';

const checklist = { uuid: 'checklist-uuid', url: '/checklists/1/' };

const addQuestion = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) => {
  await user.type(
    await screen.findByPlaceholderText('Type your question here...'),
    text,
  );
  await openAndSelectOption(user, 'Question type', 'Boolean');
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
};

describe('QuestionFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checklistsAdminQuestionsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(checklistsAdminQuestionsCreate).mockImplementation(
      ({ body }) =>
        Promise.resolve({
          data: { ...body, uuid: body.description, url: body.description },
        }) as any,
    );
  });

  it('saves the question and closes the dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionFormDialog resolve={{ checklist }} />);

    await addQuestion(user, 'First');

    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(checklistsAdminQuestionsCreate).toHaveBeenCalledWith({
      body: expect.objectContaining({
        checklist: checklist.url,
        description: 'First',
        question_type: 'boolean',
      }),
    });
  });

  it('creates a second question after "Create another"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionFormDialog resolve={{ checklist }} />);

    await user.click(await screen.findByLabelText('Create another'));
    await addQuestion(user, 'First');
    await waitFor(() =>
      expect(checklistsAdminQuestionsCreate).toHaveBeenCalledTimes(1),
    );
    await addQuestion(user, 'Second');

    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(checklistsAdminQuestionsCreate).toHaveBeenCalledTimes(2);
    expect(checklistsAdminQuestionsCreate).toHaveBeenLastCalledWith({
      body: expect.objectContaining({ description: 'Second' }),
    });
  });

  it('sends the range of a year question', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionFormDialog resolve={{ checklist }} />);

    await user.type(
      await screen.findByPlaceholderText('Type your question here...'),
      'Since when?',
    );
    await openAndSelectOption(user, 'Question type', 'Year');
    await user.type(screen.getByLabelText('Min value'), '2000');
    await user.type(screen.getByLabelText('Max value'), '2030');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(checklistsAdminQuestionsCreate).toHaveBeenCalled(),
    );
    const { body } = vi.mocked(checklistsAdminQuestionsCreate).mock.calls[0][0];
    expect(String(body.min_value)).toBe('2000');
    expect(String(body.max_value)).toBe('2030');
  });
});
