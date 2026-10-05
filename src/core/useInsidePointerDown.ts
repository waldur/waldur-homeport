import { RefObject, useEffect, useRef } from 'react';

/**
 * Marks an overlay that is portaled to <body> from a React tree outside a
 * Radix dialog (the drawer, a modal) but belongs to it, such as the docked
 * Matrix call's settings popover.
 */
const DIALOG_INSIDE_ATTRIBUTE = 'data-dialog-inside';

/**
 * Radix decides whether a pointerdown belongs to a dialog from the React
 * tree, not the DOM: it flags the pointer as inside from an
 * onPointerDownCapture on the content. Content portaled in from another tree
 * therefore reads as outside however deeply the DOM nests it, and a click on
 * it dismisses the dialog.
 *
 * This records DOM containment instead, from a native capture listener that
 * runs while the event is still travelling down; testing the target later,
 * in onPointerDownOutside, is too late, as the re-render the same pointerdown
 * triggered may have detached the node it hit. Returns a check for
 * onPointerDownOutside: whether its original event landed inside `contentRef`
 * or in an overlay marked with `data-dialog-inside`.
 */
export const useInsidePointerDown = (
  contentRef: RefObject<HTMLElement>,
): ((event: { detail: { originalEvent: Event } }) => boolean) => {
  const insidePointerDownRef = useRef<Event | null>(null);

  useEffect(() => {
    const remember = (event: Event) => {
      const target = event.target as Node | null;
      if (
        target &&
        (contentRef.current?.contains(target) ||
          (target instanceof Element &&
            target.closest(`[${DIALOG_INSIDE_ATTRIBUTE}]`)))
      ) {
        insidePointerDownRef.current = event;
      }
    };
    document.addEventListener('pointerdown', remember, true);
    return () => document.removeEventListener('pointerdown', remember, true);
  }, [contentRef]);

  return (event) => event.detail.originalEvent === insidePointerDownRef.current;
};
