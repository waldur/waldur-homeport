import { createContext, PointerEvent, useRef } from 'react';

import { useBreakpointDown } from '../useMediaQuery';

export interface HoverHandlers {
  trigger: {
    onMouseEnter(): void;
    onMouseLeave(): void;
    onPointerDown(event: PointerEvent<HTMLElement>): void;
  };
  content: {
    onMouseEnter(): void;
    onMouseLeave(): void;
    onPointerDownOutside(event: Event): void;
  };
}

/**
 * Open-on-hover for a top-level menu. Radix's Trigger opens only on click
 * or keyboard, so `open` is controlled here. Both the trigger and the
 * content need the handlers, or the menu closes while the pointer crosses
 * the gap between them; the 200ms close delay (Metronic's own) keeps it
 * from flickering shut when the pointer briefly leaves the panel.
 */
export const useHoverOpen = (
  mode: true | 'desktop',
  open: boolean,
  setOpen: (open: boolean) => void,
) => {
  const isMobile = useBreakpointDown('lg');
  const enabled = mode === true || !isMobile;
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();
  // Hover has already opened the menu by the time a mouse clicks the
  // trigger, and Radix would close it on that pointer-down twice over (the
  // trigger toggles it; the content dismisses it as an outside press). The
  // trigger cancels its toggle and leaves this flag for the content.
  const keepOpenOnPointerDown = useRef(false);

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };
  const mouse = {
    onMouseEnter: () => {
      if (!enabled) return;
      cancelClose();
      setOpen(true);
    },
    onMouseLeave: () => {
      if (!enabled) return;
      cancelClose();
      closeTimeout.current = setTimeout(() => setOpen(false), 200);
    },
  };
  const handlers: HoverHandlers = {
    trigger: {
      ...mouse,
      onPointerDown: (event) => {
        if (enabled && open && event.pointerType === 'mouse') {
          event.preventDefault();
          keepOpenOnPointerDown.current = true;
        }
      },
    },
    content: {
      ...mouse,
      onPointerDownOutside: (event) => {
        if (keepOpenOnPointerDown.current) {
          keepOpenOnPointerDown.current = false;
          event.preventDefault();
        }
      },
    },
  };
  return handlers;
};

export const HoverContext = createContext<HoverHandlers | null>(null);

// Calls the caller's handler, then ours unless the caller prevented it.
export const compose =
  <E extends { defaultPrevented: boolean }>(
    theirs: ((event: E) => void) | undefined,
    ours: ((event: E) => void) | undefined,
  ) =>
  (event: E) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours?.(event);
  };
