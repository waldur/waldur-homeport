import { FC } from 'react';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

import { FeedbackThumbButtons } from '@/ai-assistant/components/shared/FeedbackThumbButtons';
import { useModal } from '@/modal/actions';

import { FeedbackDialog } from './FeedbackDialog';

interface Props {
  messageUuid: string;
  feedbackScore: boolean | null;
  feedbackComment: string | null;
  feedbackCategory: FeedbackCategoryEnum | null;
}

export const FeedbackButtons: FC<Props> = ({
  messageUuid,
  feedbackScore,
  feedbackComment,
  feedbackCategory,
}) => {
  const { openDialog } = useModal();

  const open = (score: boolean) => {
    // When the user flips their vote, drop the prior comment/category —
    // they don't belong on a newly-opposite score.
    const keepPriorDetails = score === feedbackScore;
    openDialog(FeedbackDialog, {
      resolve: {
        source: { kind: 'message', messageUuid },
        score,
        currentComment: keepPriorDetails ? feedbackComment : null,
        currentCategory: keepPriorDetails ? feedbackCategory : null,
      },
      size: 'md',
    });
  };

  return (
    <FeedbackThumbButtons
      upActive={feedbackScore === true}
      downActive={feedbackScore === false}
      onUp={() => open(true)}
      onDown={() => open(false)}
    />
  );
};
