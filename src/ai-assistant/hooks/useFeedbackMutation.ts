import {
  chatMessagesFeedback,
  marketplaceChatFeedback,
  type FeedbackCategoryEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

// A vote targets either an authenticated message (by UUID) or an anonymous
// interaction (by HMAC-bound token). The two endpoints differ only here.
export type FeedbackSource =
  | { kind: 'message'; messageUuid: string }
  | { kind: 'anonymous'; interactionUuid: string; feedbackToken: string };

interface FeedbackBody {
  score: boolean;
  comment?: string;
  category?: FeedbackCategoryEnum;
}

/** Single feedback mutation for both the authenticated and anonymous assistants. */
export const useFeedbackMutation = (source: FeedbackSource) => {
  const mutation = useManagedMutation<any, any, FeedbackBody>({
    mutationFn: async (body) => {
      if (source.kind === 'message') {
        const response = await chatMessagesFeedback({
          path: { uuid: source.messageUuid },
          body,
        });
        return response.data;
      }
      const response = await marketplaceChatFeedback({
        body: {
          interaction_uuid: source.interactionUuid,
          feedback_token: source.feedbackToken,
          score: body.score ? 1 : -1,
          ...(body.category ? { category: body.category } : {}),
          ...(body.comment ? { comment: body.comment } : {}),
        },
      });
      return response.data;
    },
    // The dialog closes itself after its post-submit step (thread patch / vote
    // reflection); don't let the mutation close it early.
    closeModal: false,
    successMessage: translate('Feedback has been submitted'),
    errorMessage: translate('Unable to submit feedback.'),
    invalidateQueries:
      source.kind === 'message'
        ? [
            { queryKey: ['table', 'SupportAIAssistantLogsList'] },
            { queryKey: ['chatMessages'] },
          ]
        : undefined,
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
};
