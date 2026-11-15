import {
  FC,
  KeyboardEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { translate } from '@/i18n';

import { useDrawer } from './actions';
import {
  clampDrawerWidth,
  DRAWER_MIN_WIDTH,
  DRAWER_RESIZE_STEP,
  DRAWER_SNAP_DISTANCE,
  measureMaxDrawerWidth,
  setDragWidth,
  storeDrawerWidth,
} from './drawerWidth';

interface DragState {
  pointerId: number;
  startX: number;
  startWidth: number;
  max: number;
  width: number;
  moved: boolean;
  frame: number | null;
}

/**
 * The drawer's left edge, dragged to resize it. While dragging, the width is
 * written onto the panel as `--drawer-drag-width` once a frame, so the
 * drawer contents do not re-render on every pointer move; on release the
 * property goes and the drawer state (and storage) take the width. It is a
 * property of its own, not React's `--drawer-width`: React only writes a
 * style when its value changes, so overwriting React's would leave a stale
 * width behind whenever the release lands on the state it already had.
 * A release at the widest width expands the drawer, the same as the expand
 * button; a cancelled drag leaves the width as it was.
 *
 * Also a focusable separator: arrow keys resize, Home/End go to the narrowest
 * and widest, and a double click goes back to the default width.
 */
export const DrawerResizeHandle: FC<{ panel: HTMLElement | null }> = ({
  panel,
}) => {
  const { width, setWidth, expanded, setExpanded, drawerProps } = useDrawer();
  const storageKey: string | undefined = drawerProps.shellClass;
  const min: number = drawerProps.minWidth ?? DRAWER_MIN_WIDTH;
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const commit = useCallback(
    (next: number, max: number) => {
      if (next >= max - DRAWER_SNAP_DISTANCE) {
        setExpanded(true);
        return;
      }
      setExpanded(false);
      setWidth(next);
      storeDrawerWidth(storageKey, next);
    },
    [setExpanded, setWidth, storageKey],
  );

  /**
   * The widest it can get changes with the window and the sidebar, not with
   * the panel, so it is refreshed when the handle is about to be used and
   * on window resizes rather than on every panel resize.
   */
  const refreshMax = useCallback(() => {
    const max = measureMaxDrawerWidth(min);
    handleRef.current?.setAttribute('aria-valuemax', String(Math.round(max)));
    return max;
  }, [min]);

  // aria-valuenow follows the panel without re-rendering React per frame.
  useEffect(() => {
    const handle = handleRef.current;
    if (!panel || !handle) return;
    refreshMax();
    const observer = new ResizeObserver(([entry]) => {
      handle.setAttribute(
        'aria-valuenow',
        String(Math.round(entry.borderBoxSize?.[0]?.inlineSize ?? 0)),
      );
    });
    observer.observe(panel);
    window.addEventListener('resize', refreshMax);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refreshMax);
    };
  }, [panel, refreshMax]);

  const endDrag = (event: PointerEvent<HTMLDivElement>, keep: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.frame !== null) cancelAnimationFrame(drag.frame);
    if (panel) {
      delete panel.dataset.resizing;
      setDragWidth(panel, null);
    }
    if (keep && drag.moved) commit(drag.width, drag.max);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!panel || event.button !== 0) return;
    // No text selection starts under the drag. That also cancels the focus a
    // click gives, so the arrow keys work after one only when focused here;
    // without the keyboard focus ring, which a script focus would otherwise
    // inherit from the dialog's initial focus.
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true, focusVisible: false });
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = panel.getBoundingClientRect().width;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: current,
      max: refreshMax(),
      width: current,
      moved: false,
      frame: null,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!panel || !drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.startX) < 2) return;
      drag.moved = true;
      // Turns off the width transition, which would trail the pointer.
      panel.dataset.resizing = 'true';
    }
    // The drawer is anchored right: dragging left widens it.
    drag.width = clampDrawerWidth(
      drag.startWidth + drag.startX - event.clientX,
      min,
      drag.max,
    );
    if (drag.frame === null) {
      drag.frame = requestAnimationFrame(() => {
        drag.frame = null;
        setDragWidth(panel, drag.width);
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!panel) return;
    const max = refreshMax();
    // From the width it is heading to: with the key held down, the panel is
    // still animating towards the last step when the next one comes. Capped
    // at the widest it can get, as the panel itself is after the window
    // narrows.
    const current =
      !expanded && width !== null
        ? Math.min(width, max)
        : panel.getBoundingClientRect().width;
    const step = DRAWER_RESIZE_STEP * (event.shiftKey ? 4 : 1);
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
        next = current + step;
        break;
      case 'ArrowRight':
        next = current - step;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(clampDrawerWidth(next, min, max), max);
  };

  const onDoubleClick = () => {
    setExpanded(false);
    setWidth(null);
    storeDrawerWidth(storageKey, null);
  };

  // A focusable separator is the WAI-ARIA window-splitter widget, an
  // interactive role that jsx-a11y does not model.
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={translate('Resize panel')}
      aria-valuemin={min}
      tabIndex={0}
      data-slot="drawer-resize-handle"
      title={translate('Drag to resize, double-click to reset')}
      // First in the row however late in the DOM (see DrawerRoot), and
      // sticky so it stays beside a drawer whose whole panel scrolls; the
      // negative margin keeps it from taking width from the contents.
      className="group sticky top-0 z-2 order-first -me-2 hidden h-full w-2 shrink-0 self-start cursor-col-resize touch-none outline-none lg:block"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endDrag(event, true)}
      // Interrupted (a pen or touch cancel, the pointer taken away): the
      // width stays as it was.
      onPointerCancel={(event) => endDrag(event, false)}
      onLostPointerCapture={(event) => endDrag(event, false)}
      onFocus={refreshMax}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-brand-solid opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [[data-resizing]_&]:opacity-100" />
    </div>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
};
