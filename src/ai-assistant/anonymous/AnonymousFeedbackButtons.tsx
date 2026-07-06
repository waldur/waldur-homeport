import { FC, useState } from 'react';

import { FeedbackDialog } from '@/ai-assistant/components/FeedbackDialog';
import { FeedbackThumbButtons } from '@/ai-assistant/components/shared/FeedbackThumbButtons';
import { useModal } from '@/modal/actions';

// The anonymous endpoint caps the comment at 500 chars (500 server-side).
const COMMENT_MAX = 500;

interface Props {
  interactionUuid: string;
  feedbackToken: string;
}

export const AnonymousFeedbackButtons: FC<Props> = ({
  interactionUuid,
  feedbackToken,
}) => {
  const { openDialog } = useModal();
  // Client-only reflection of the recorded vote — an anonymous visitor has no
  // persisted feedback state to read back. Set only on a confirmed submit so a
  // cancelled dialog never leaves a false "voted" state.
  const [vote, setVote] = useState<1 | -1 | null>(null);

  const open = (score: boolean) =>
    openDialog(FeedbackDialog, {
      resolve: {
        source: { kind: 'anonymous', interactionUuid, feedbackToken },
        score,
        requireCategory: true,
        commentMax: COMMENT_MAX,
        onSubmitted: () => setVote(score ? 1 : -1),
      },
      size: 'md',
    });

  return (
    <FeedbackThumbButtons
      upActive={vote === 1}
      downActive={vote === -1}
      onUp={() => open(true)}
      onDown={() => open(false)}
    />
  );
};
