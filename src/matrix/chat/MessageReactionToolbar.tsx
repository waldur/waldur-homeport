import { PlusIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { translate } from '@/i18n';

import { ReactionAggregate } from './types';
import { useEmojiPicker } from './useEmojiPicker';
import { useReactions } from './useReactions';

// Minimum distance from the top of the chat stream before the picker is
// allowed to open upward. Anything closer flips it below the bubble.
const FLIP_THRESHOLD_PX = 60;
// Approximate height of the expanded picker (max-height in CSS) — used
// to decide whether it has room to open upward from the toolbar.
const PICKER_HEIGHT_PX = 290;

interface QuickEmoji {
  key: string;
  label: string;
}

const QUICK_ROW: readonly QuickEmoji[] = [
  { key: '👍', label: 'thumbs up' },
  { key: '❤️', label: 'red heart' },
  { key: '🎉', label: 'party' },
  { key: '😄', label: 'smile' },
];

interface Props {
  eventId: string;
  reactions: ReactionAggregate[] | undefined;
}

export const MessageReactionToolbar: FC<Props> = ({ eventId, reactions }) => {
  const { react, unreact } = useReactions({ eventId, reactions });
  const { triggerRef, toggle, open, picker } = useEmojiPicker(react);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [flipBelow, setFlipBelow] = useState(false);
  const [pickerFlipDown, setPickerFlipDown] = useState(false);

  // If the bubble is near the top of the chat stream, there's no room
  // above for the picker — flip it below the bubble instead.
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const stream = toolbar.closest('.tc-stream') as HTMLElement | null;
    if (!stream) return;
    const bubble = toolbar.parentElement;
    if (!bubble) return;

    const check = () => {
      const bubbleTop = bubble.getBoundingClientRect().top;
      const streamTop = stream.getBoundingClientRect().top;
      setFlipBelow(bubbleTop - streamTop < FLIP_THRESHOLD_PX);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(stream);
    observer.observe(bubble);
    stream.addEventListener('scroll', check, { passive: true });
    return () => {
      observer.disconnect();
      stream.removeEventListener('scroll', check);
    };
  }, []);

  // When the picker opens, decide if it fits above the toolbar; if not,
  // flip it to open downward. Independent of the toolbar's own flip
  // because the picker is much taller than the toolbar.
  useEffect(() => {
    if (!open) return;
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const stream = toolbar.closest('.tc-stream') as HTMLElement | null;
    if (!stream) return;
    const toolbarRect = toolbar.getBoundingClientRect();
    const streamRect = stream.getBoundingClientRect();
    const roomAbove = toolbarRect.top - streamRect.top;
    const roomBelow = streamRect.bottom - toolbarRect.bottom;
    setPickerFlipDown(roomAbove < PICKER_HEIGHT_PX && roomBelow > roomAbove);
  }, [open]);

  const handleQuickClick = (key: string, reactedByMe: boolean) => {
    if (reactedByMe) unreact(key);
    else react(key);
  };

  return (
    <div
      ref={toolbarRef}
      className={classNames('tc-msg-reactions-toolbar', {
        'is-below': flipBelow,
        'is-picker-down': pickerFlipDown,
      })}
      role="toolbar"
      aria-label={translate('React to message')}
    >
      {QUICK_ROW.map((emoji) => {
        const reactedByMe = reactions?.some(
          (r) => r.key === emoji.key && r.reactedByMe,
        );
        return (
          <button
            key={emoji.key}
            type="button"
            className={classNames('tc-msg-reactions-toolbar__btn', {
              'is-active': reactedByMe,
            })}
            aria-pressed={Boolean(reactedByMe)}
            aria-label={translate('React with {label}', {
              label: emoji.label,
            })}
            onClick={() => handleQuickClick(emoji.key, Boolean(reactedByMe))}
          >
            {emoji.key}
          </button>
        );
      })}
      <span className="tc-msg-reactions-toolbar__divider" aria-hidden />
      <button
        ref={triggerRef}
        type="button"
        className="tc-msg-reactions-toolbar__btn tc-msg-reactions-toolbar__more"
        aria-label={translate('More emojis')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <PlusIcon size={14} weight="bold" />
      </button>
      {picker}
    </div>
  );
};
