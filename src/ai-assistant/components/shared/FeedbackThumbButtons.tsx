import { ThumbsDownIcon, ThumbsUpIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

interface Props {
  upActive: boolean;
  downActive: boolean;
  onUp: () => void;
  onDown: () => void;
}

// Shared thumbs-up/down markup for assistant feedback. Both threads render the
// same buttons and labels; each wires its own click handlers and active state.
export const FeedbackThumbButtons: FC<Props> = ({
  upActive,
  downActive,
  onUp,
  onDown,
}) => (
  <>
    <button
      type="button"
      className="aui-message-action-btn is-positive"
      aria-label={
        upActive
          ? translate('Helpful (selected). Activate to edit your feedback.')
          : translate('Helpful')
      }
      aria-pressed={upActive}
      onClick={onUp}
    >
      <ThumbsUpIcon weight={upActive ? 'fill' : 'regular'} size={16} />
    </button>
    <button
      type="button"
      className="aui-message-action-btn is-negative"
      aria-label={
        downActive
          ? translate('Not helpful (selected). Activate to edit your feedback.')
          : translate('Not helpful')
      }
      aria-pressed={downActive}
      onClick={onDown}
    >
      <ThumbsDownIcon weight={downActive ? 'fill' : 'regular'} size={16} />
    </button>
  </>
);
