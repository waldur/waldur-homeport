import { RefObject, useEffect } from 'react';

/**
 * Keeps focus moving within a modal Radix dialog when the element losing it
 * removes DOM nodes as it goes.
 *
 * A modal Radix dialog's focus trap watches its content for removed nodes,
 * and when focus is on <body> then, moves it to the content, once per batch
 * of removals. Between a focusout and the focusin that follows, focus is on
 * <body>; and react-select removes its screen-reader status on blur. So a Tab
 * out of a select landed on the dialog itself instead of the next control,
 * and Tab could never get past the select.
 *
 * This remembers where a focusout inside `contentRef` was heading and, while
 * the trap's focus calls run (the rest of the task), sends focus on there
 * whenever the trap puts it on the content itself.
 */
export const useFocusThroughRemovals = (
  contentRef: RefObject<HTMLElement>,
  active: boolean,
) => {
  useEffect(() => {
    if (!active) return;
    let heading: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onFocusOut = (event: FocusEvent) => {
      const content = contentRef.current;
      const next = event.relatedTarget as HTMLElement | null;
      // The trap moving focus to the content: keep heading where we were.
      if (!content || next === content) return;
      heading = next && content.contains(next) ? next : null;
      clearTimeout(timer);
      timer = setTimeout(() => {
        heading = null;
      });
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target === contentRef.current && heading?.isConnected) {
        heading.focus();
      }
    };

    document.addEventListener('focusout', onFocusOut, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('focusout', onFocusOut, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, [contentRef, active]);
};
