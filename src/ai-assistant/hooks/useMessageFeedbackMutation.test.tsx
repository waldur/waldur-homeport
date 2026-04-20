import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { useMessageFeedbackMutation } from './useMessageFeedbackMutation';

vi.mock('waldur-js-client');

const renderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const store = createStore(() => ({}), applyMiddleware(thunk));
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return renderHook(() => useMessageFeedbackMutation('msg-uuid-1'), {
    wrapper,
  });
};

describe('useMessageFeedbackMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls chatMessagesFeedback with the correct body for thumbs-up', async () => {
    vi.mocked(sdk.chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: true },
      error: undefined,
    } as any);

    const { result } = renderWithProviders();
    result.current.submit({ score: true });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(sdk.chatMessagesFeedback).toHaveBeenCalledWith({
      path: { uuid: 'msg-uuid-1' },
      body: { score: true },
    });
  });

  it('calls chatMessagesFeedback with comment + categories for thumbs-down', async () => {
    vi.mocked(sdk.chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: false },
      error: undefined,
    } as any);

    const { result } = renderWithProviders();
    result.current.submit({
      score: false,
      comment: 'wrong vm count',
      category: 'inaccurate',
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(sdk.chatMessagesFeedback).toHaveBeenCalledWith({
      path: { uuid: 'msg-uuid-1' },
      body: {
        score: false,
        comment: 'wrong vm count',
        category: 'inaccurate',
      },
    });
  });
});
