import { FC } from 'react';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

import {
  FeedbackForm,
  FeedbackFormValues,
} from '@/ai-assistant/components/shared/FeedbackForm';
import {
  FeedbackSource,
  useFeedbackMutation,
} from '@/ai-assistant/hooks/useFeedbackMutation';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { useModal } from '@/modal/actions';

interface Resolve {
  source: FeedbackSource;
  score: boolean;
  currentComment?: string | null;
  currentCategory?: FeedbackCategoryEnum | null;
  // Anonymous votes require a category on a negative and cap the comment at 500.
  requireCategory?: boolean;
  commentMax?: number;
  // Lets the anonymous panel reflect the vote (it has no persisted state to read
  // back); fires only after a confirmed submit.
  onSubmitted?: () => void;
}

export const FeedbackDialog: FC<{ resolve: Resolve }> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { patchMessageByBackendUuid } = useThreadContext();
  const { submitAsync, isSubmitting } = useFeedbackMutation(resolve.source);

  const onSubmit = async (values: FeedbackFormValues) => {
    try {
      const updated = await submitAsync({
        score: resolve.score,
        comment: values.comment || undefined,
        // Category only rides a negative vote — positive rejects it server-side.
        category: resolve.score ? undefined : values.category || undefined,
      });
      if (resolve.source.kind === 'message' && updated) {
        patchMessageByBackendUuid(resolve.source.messageUuid, {
          feedback_score: updated.feedback_score,
          feedback_comment: updated.feedback_comment,
          feedback_category: updated.feedback_category,
          feedback_submitted_at: updated.feedback_submitted_at,
        });
      }
      resolve.onSubmitted?.();
      closeDialog();
    } catch {
      // mutation's onError already shows a toast; keep dialog open.
    }
  };

  return (
    <FeedbackForm
      score={resolve.score}
      initialValues={{
        comment: resolve.currentComment ?? '',
        category: resolve.currentCategory ?? null,
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      requireCategory={resolve.requireCategory}
      commentMax={resolve.commentMax}
    />
  );
};
