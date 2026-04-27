import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  chatMessagesFeedback,
  type FeedbackCategoryEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface FeedbackSubmitBody {
  score: boolean;
  comment?: string;
  category?: FeedbackCategoryEnum | null;
}

export const useMessageFeedbackMutation = (messageUuid: string) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: FeedbackSubmitBody) => {
      const response = await chatMessagesFeedback({
        path: { uuid: messageUuid },
        body,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      dispatch(showSuccess(translate('Feedback has been submitted')));
      void queryClient.invalidateQueries({
        queryKey: ['table', 'SupportAIAssistantLogsList'],
      });
      void queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(error, translate('Unable to submit feedback.')),
      );
    },
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
};
