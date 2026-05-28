import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatMessagesFeedback } from 'waldur-js-client';

import { FEEDBACK_SELECT_OPTIONS } from '@/ai-assistant/lib/feedback/categories';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';

import { FeedbackDialog } from './FeedbackDialog';

const patchMessageByBackendUuid = vi.fn();
vi.mock('@/ai-assistant/logic/ThreadProvider', () => ({
  useThreadContext: () => ({ patchMessageByBackendUuid }),
}));

const renderDialog = (
  initial: { score?: boolean; [key: string]: any } = {},
) => {
  return renderWithProviders(
    <FeedbackDialog
      resolve={{
        messageUuid: 'msg-1',
        score: false,
        currentComment: '',
        currentCategory: undefined,
        ...initial,
      }}
    />,
  );
};

describe('FeedbackDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: false },
      error: undefined,
    } as any);
  });

  it('renders all 5 category options and a comment field', async () => {
    const user = userEvent.setup();
    renderDialog();

    const selectContainer = getSelectByLabel(/What type of issue/);
    expect(selectContainer).toBeInTheDocument();

    // Open select to verify options are present
    const combobox = within(selectContainer as HTMLElement).getByRole(
      'combobox',
    );
    await user.click(combobox);

    FEEDBACK_SELECT_OPTIONS.forEach((opt) => {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/what was wrong/i)).toBeInTheDocument();
  });

  it('submits selected categories and comment to the API', async () => {
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(
      user,
      /What type of issue/,
      'Wrong or inaccurate',
    );
    await user.type(
      screen.getByPlaceholderText(/what was wrong/i),
      'it said 5 but I have 3',
    );
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(chatMessagesFeedback).toHaveBeenCalledWith({
        path: { uuid: 'msg-1' },
        body: {
          score: false,
          comment: 'it said 5 but I have 3',
          category: 'inaccurate',
        },
      });
    });
  });

  it('pre-fills when resolve has existing values', () => {
    renderDialog({
      currentComment: 'previous comment',
      currentCategory: 'other',
    });
    expect(screen.getByDisplayValue('previous comment')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('hides the categories section when score is true', () => {
    renderDialog({ score: true });
    expect(screen.queryByText(/What type of issue/)).toBeNull();
  });

  it('submits score=true with just a comment when thumbs-up dialog is used', async () => {
    const user = userEvent.setup();
    renderDialog({ score: true });
    await user.type(
      screen.getByPlaceholderText(/what was helpful/i),
      'nice answer',
    );
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(chatMessagesFeedback).toHaveBeenCalledWith({
        path: { uuid: 'msg-1' },
        body: {
          score: true,
          comment: 'nice answer',
        },
      });
    });
  });

  it('patches thread state with the server response after a successful submit', async () => {
    const user = userEvent.setup();
    vi.mocked(chatMessagesFeedback).mockResolvedValue({
      data: {
        feedback_score: false,
        feedback_comment: 'wrong info',
        feedback_category: 'inaccurate',
        feedback_submitted_at: '2026-04-19T10:00:00Z',
      },
      error: undefined,
    } as any);

    renderDialog();
    await openAndSelectOption(
      user,
      /What type of issue/,
      'Wrong or inaccurate',
    );
    await user.type(
      screen.getByPlaceholderText(/what was wrong/i),
      'wrong info',
    );
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(patchMessageByBackendUuid).toHaveBeenCalledWith('msg-1', {
        feedback_score: false,
        feedback_comment: 'wrong info',
        feedback_category: 'inaccurate',
        feedback_submitted_at: '2026-04-19T10:00:00Z',
      });
    });
  });
});
