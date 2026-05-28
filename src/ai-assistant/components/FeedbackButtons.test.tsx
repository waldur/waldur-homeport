import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatMessagesFeedback } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { FeedbackButtons } from './FeedbackButtons';

const renderBtns = (
  props: Partial<Parameters<typeof FeedbackButtons>[0]> = {},
) => {
  return renderWithProviders(
    <FeedbackButtons
      messageUuid="msg-1"
      feedbackScore={null}
      feedbackComment={null}
      feedbackCategory={null}
      {...props}
    />,
  );
};

describe('FeedbackButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: true },
      error: undefined,
    } as any);
  });

  it('renders both thumb buttons with aria-pressed reflecting state', () => {
    renderBtns({ feedbackScore: true });
    expect(screen.getByRole('button', { pressed: true })).toHaveAccessibleName(
      /selected/i,
    );
    expect(screen.getByRole('button', { pressed: false })).toHaveAccessibleName(
      'Not helpful',
    );
  });

  it('dispatches the dialog with score=true on thumbs-up click', async () => {
    renderBtns();
    await userEvent.click(screen.getByLabelText('Helpful'));
    expect(useModal().openDialog).toHaveBeenCalled();
    const resolveArg =
      vi.mocked(useModal()).openDialog.mock.calls[0][1]?.resolve;
    expect(resolveArg.score).toBe(true);
    expect(resolveArg.currentCategory).toBeNull();
    expect(chatMessagesFeedback).not.toHaveBeenCalled();
  });

  it('pre-fills category and comment when re-opening the same vote', async () => {
    renderBtns({
      feedbackScore: false,
      feedbackComment: 'wrong info',
      feedbackCategory: 'inaccurate',
    });
    // Down is the currently-selected vote; its aria-label uses the selected form.
    const downBtn = screen.getByRole('button', { pressed: true });
    await userEvent.click(downBtn);
    const resolveArg =
      vi.mocked(useModal()).openDialog.mock.calls[0][1]?.resolve;
    expect(resolveArg.score).toBe(false);
    expect(resolveArg.currentCategory).toBe('inaccurate');
    expect(resolveArg.currentComment).toBe('wrong info');
  });

  it('clears prior comment and category when the user flips the vote', async () => {
    renderBtns({
      feedbackScore: false,
      feedbackComment: 'wrong info',
      feedbackCategory: 'inaccurate',
    });
    // Up is unselected when the user previously voted down — exact label match.
    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));
    const resolveArg = vi.mocked(useModal().openDialog).mock.calls[0][1]
      ?.resolve;
    expect(resolveArg.score).toBe(true);
    expect(resolveArg.currentComment).toBeNull();
    expect(resolveArg.currentCategory).toBeNull();
  });
});
