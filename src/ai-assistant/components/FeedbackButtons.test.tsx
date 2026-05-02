import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { FeedbackButtons } from './FeedbackButtons';

vi.mock('waldur-js-client');

const mockOpenDialog = vi.fn();
vi.mock('@/modal/actions', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useModal: () => ({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    }),
  };
});

const renderBtns = (
  props: Partial<Parameters<typeof FeedbackButtons>[0]> = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const store = createStore(() => ({}), applyMiddleware(thunk));
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return render(
    <FeedbackButtons
      messageUuid="msg-1"
      feedbackScore={null}
      feedbackComment={null}
      feedbackCategory={null}
      {...props}
    />,
    { wrapper },
  );
};

describe('FeedbackButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sdk.chatMessagesFeedback).mockResolvedValue({
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
    expect(mockOpenDialog).toHaveBeenCalled();
    const resolveArg = mockOpenDialog.mock.calls[0][1]?.resolve as any;
    expect(resolveArg.score).toBe(true);
    expect(resolveArg.currentCategory).toBeNull();
    expect(sdk.chatMessagesFeedback).not.toHaveBeenCalled();
  });

  it('pre-fills category and comment when re-opening the same vote', async () => {
    renderBtns({
      feedbackScore: false,
      feedbackComment: 'wrong info',
      feedbackCategory: 'inaccurate' as any,
    });
    // Down is the currently-selected vote; its aria-label uses the selected form.
    const downBtn = screen.getByRole('button', { pressed: true });
    await userEvent.click(downBtn);
    const resolveArg = mockOpenDialog.mock.calls[0][1]?.resolve as any;
    expect(resolveArg.score).toBe(false);
    expect(resolveArg.currentCategory).toBe('inaccurate');
    expect(resolveArg.currentComment).toBe('wrong info');
  });

  it('clears prior comment and category when the user flips the vote', async () => {
    renderBtns({
      feedbackScore: false,
      feedbackComment: 'wrong info',
      feedbackCategory: 'inaccurate' as any,
    });
    // Up is unselected when the user previously voted down — exact label match.
    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));
    const resolveArg = mockOpenDialog.mock.calls[0][1]?.resolve as any;
    expect(resolveArg.score).toBe(true);
    expect(resolveArg.currentComment).toBeNull();
    expect(resolveArg.currentCategory).toBeNull();
  });
});
