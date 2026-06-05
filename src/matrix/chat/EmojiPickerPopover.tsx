import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FC, useEffect, useRef } from 'react';

import { useTheme } from '@/theme/useTheme';

interface Props {
  onPick: (key: string) => void;
  onClose: () => void;
}

const EmojiPickerPopover: FC<Props> = ({ onPick, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Close on click outside.
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [onClose]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="tc-msg-emoji-popover"
      role="dialog"
      aria-label="Emoji picker"
    >
      <Picker
        data={data}
        onEmojiSelect={(e: any) => {
          onPick(e.native ?? e.shortcodes ?? '');
          onClose();
        }}
        autoFocus
        theme={theme}
        previewPosition="none"
        skinTonePosition="none"
        navPosition="none"
        perLine={8}
        emojiButtonSize={24}
        emojiSize={16}
        maxFrequentRows={1}
      />
    </div>
  );
};

// Default export so React.lazy can pick it up.
export default EmojiPickerPopover;
