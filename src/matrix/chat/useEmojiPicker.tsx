import { ReactElement, Suspense, lazy, useRef, useState } from 'react';

const EmojiPickerPopover = lazy(() => import('./EmojiPickerPopover'));

interface UseEmojiPickerResult {
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  toggle: () => void;
  /** Lazy-loaded picker JSX. Renders `null` when closed. Place where you
   *  want the popover to anchor in the DOM. */
  picker: ReactElement | null;
}

/**
 * Shared open/close + focus-return logic for the emoji picker popover.
 * Used by both the hover toolbar's "more" button and the chip row's
 * inline "+" so they behave identically and share the lazy load.
 */
export function useEmojiPicker(
  onPick: (key: string) => void,
): UseEmojiPickerResult {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    // Defer so the popover unmounts first, then focus the trigger.
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const toggle = () => setOpen((v) => !v);

  const picker = open ? (
    <Suspense fallback={null}>
      <EmojiPickerPopover
        onPick={(key) => {
          onPick(key);
          close();
        }}
        onClose={close}
      />
    </Suspense>
  ) : null;

  return { open, triggerRef, toggle, picker };
}
