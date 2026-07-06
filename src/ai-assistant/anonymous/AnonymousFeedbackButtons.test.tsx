import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';

import { AnonymousFeedbackButtons } from './AnonymousFeedbackButtons';

// `useModal` is globally mocked (test/mocks/modal.js); the buttons just open the
// dialog and reflect the vote once it reports a submission.
const setup = () =>
  render(<AnonymousFeedbackButtons interactionUuid="i1" feedbackToken="t1" />);

const lastResolve = (): any =>
  vi.mocked(useModal().openDialog).mock.calls[0][1];

describe('AnonymousFeedbackButtons', () => {
  beforeEach(() => {
    vi.mocked(useModal().openDialog).mockClear();
  });

  it('opens the feedback dialog with score=true on thumbs-up (mirrors auth)', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Helpful' }));
    expect(lastResolve().resolve.score).toBe(true);
  });

  it('opens the feedback dialog with score=false on thumbs-down', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Not helpful' }));
    expect(lastResolve().resolve.score).toBe(false);
  });

  it('reflects the vote only after the dialog confirms submission', async () => {
    const user = userEvent.setup();
    setup();
    const up = screen.getByRole('button', { name: 'Helpful' });
    await user.click(up);
    // No optimistic state — cancelling the dialog leaves it unvoted.
    expect(up).toHaveAttribute('aria-pressed', 'false');
    act(() => lastResolve().resolve.onSubmitted());
    expect(up).toHaveAttribute('aria-pressed', 'true');
  });
});
