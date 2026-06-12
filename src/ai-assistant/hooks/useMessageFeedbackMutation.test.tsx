import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatMessagesFeedback, Message } from 'waldur-js-client';

import { createTestWrapper } from '@/test/harness';

import { useMessageFeedbackMutation } from './useMessageFeedbackMutation';

const renderWithProviders = () => {
  return renderHook(() => useMessageFeedbackMutation('msg-uuid-1'), {
    wrapper: createTestWrapper().wrapper,
  });
};

describe('useMessageFeedbackMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls chatMessagesFeedback with the correct body for thumbs-up', async () => {
    vi.mocked(chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: true } as Message,
    } as any);

    const { result } = renderWithProviders();
    result.current.submit({ score: true });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(chatMessagesFeedback).toHaveBeenCalledWith({
      path: { uuid: 'msg-uuid-1' },
      body: { score: true },
    });
  });

  it('calls chatMessagesFeedback with comment + categories for thumbs-down', async () => {
    vi.mocked(chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: false } as Message,
    } as any);

    const { result } = renderWithProviders();
    result.current.submit({
      score: false,
      comment: 'wrong vm count',
      category: 'inaccurate',
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(chatMessagesFeedback).toHaveBeenCalledWith({
      path: { uuid: 'msg-uuid-1' },
      body: {
        score: false,
        comment: 'wrong vm count',
        category: 'inaccurate',
      },
    });
  });
});
