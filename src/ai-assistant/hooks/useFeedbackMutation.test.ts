import { describe, expect, it, vi } from 'vitest';
import {
  chatMessagesFeedback,
  marketplaceChatFeedback,
} from 'waldur-js-client';

import { useFeedbackMutation } from './useFeedbackMutation';

// useManagedMutation pulls in React context (modal/notify/query); stub it to
// expose the raw mutationFn — this hook only asserts the SDK call shape.
// waldur-js-client is globally auto-mocked (test/mocks/modal.js).
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (opts: any) => ({
    mutate: opts.mutationFn,
    mutateAsync: opts.mutationFn,
    isPending: false,
  }),
}));

describe('useFeedbackMutation', () => {
  it('posts a message vote to chatMessagesFeedback by uuid', async () => {
    vi.mocked(chatMessagesFeedback).mockResolvedValue({ data: {} } as any);
    const { submitAsync } = useFeedbackMutation({
      kind: 'message',
      messageUuid: 'm1',
    });
    await submitAsync({ score: false, comment: 'x', category: 'inaccurate' });
    expect(chatMessagesFeedback).toHaveBeenCalledWith({
      path: { uuid: 'm1' },
      body: { score: false, comment: 'x', category: 'inaccurate' },
    });
  });

  it('posts an anonymous negative vote with token + numeric score', async () => {
    vi.mocked(marketplaceChatFeedback).mockResolvedValue({ data: {} } as any);
    const { submitAsync } = useFeedbackMutation({
      kind: 'anonymous',
      interactionUuid: 'i1',
      feedbackToken: 't1',
    });
    await submitAsync({
      score: false,
      comment: 'wrong',
      category: 'inaccurate',
    });
    expect(marketplaceChatFeedback).toHaveBeenCalledWith({
      body: {
        interaction_uuid: 'i1',
        feedback_token: 't1',
        score: -1,
        category: 'inaccurate',
        comment: 'wrong',
      },
    });
  });

  it('omits category and comment on an anonymous positive vote', async () => {
    vi.mocked(marketplaceChatFeedback).mockClear();
    vi.mocked(marketplaceChatFeedback).mockResolvedValue({ data: {} } as any);
    const { submitAsync } = useFeedbackMutation({
      kind: 'anonymous',
      interactionUuid: 'i1',
      feedbackToken: 't1',
    });
    await submitAsync({ score: true });
    expect(marketplaceChatFeedback).toHaveBeenCalledWith({
      body: { interaction_uuid: 'i1', feedback_token: 't1', score: 1 },
    });
  });
});
