import {
  chatMessagesFeedback,
  type FeedbackCategoryEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FeedbackSubmitBody {
  score: boolean;
  comment?: string;
  category?: FeedbackCategoryEnum | null;
}

export const useMessageFeedbackMutation = (messageUuid: string) => {
  const mutation = useManagedMutation<any, any, FeedbackSubmitBody>({
    mutationFn: async (body) => {
      const response = await chatMessagesFeedback({
        path: { uuid: messageUuid },
        body,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    successMessage: translate('Feedback has been submitted'),
    errorMessage: translate('Unable to submit feedback.'),
    invalidateQueries: [
      { queryKey: ['table', 'SupportAIAssistantLogsList'] },
      { queryKey: ['chatMessages'] },
    ],
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
};
