import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';

interface ComposerPopup<T> {
  items: T[];
  activeIndex: number;
  setActiveIndex: (update: (index: number) => number) => void;
  onPick: (item: T) => void;
  onClose: () => void;
}

/**
 * A key for a popup the composer drives while focus stays in the textarea,
 * the command menu and the mention list alike: the arrows move and wrap,
 * Enter or Tab picks, Escape closes, and Shift+Enter stays a new line.
 * Returns whether the popup took the key.
 */
export function handleComposerPopupKey<T>(
  e: KeyboardEvent,
  { items, activeIndex, setActiveIndex, onPick, onClose }: ComposerPopup<T>,
): boolean {
  const count = items.length;
  if (count === 0) return false;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActiveIndex((i) => (i + 1) % count);
    return true;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActiveIndex((i) => (i - 1 + count) % count);
    return true;
  }
  if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
    e.preventDefault();
    onPick(items[Math.min(activeIndex, count - 1)]);
    return true;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    onClose();
    return true;
  }
  return false;
}

/**
 * Keeps a composer popup's active option in view as the arrows move past the
 * rows the popup has room for, and lets only a moving pointer take the
 * highlight. When the list scrolls under a pointer at rest, browsers report
 * the row now under it as entered, and Safari as moved too, but at the same
 * spot; taken as hovers, these would pull the highlight back from the keys.
 */
export function useComposerPopupList(
  activeIndex: number,
  setActiveIndex: (index: number) => void,
) {
  const list = useRef<HTMLElement | null>(null);
  const lastPoint = useRef<string | null>(null);
  // A popup opened anew must not compare with where the pointer last was.
  const listRef = useCallback((element: HTMLElement | null) => {
    list.current = element;
    lastPoint.current = null;
  }, []);

  useEffect(() => {
    list.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const pointAt = useCallback(
    (index: number) => (e: MouseEvent) => {
      const point = `${e.clientX},${e.clientY}`;
      const moved = lastPoint.current !== null && point !== lastPoint.current;
      lastPoint.current = point;
      if (moved) setActiveIndex(index);
    },
    [setActiveIndex],
  );

  return { listRef, pointAt };
}
