import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from './cn';
import { unscrollPanel } from './unscrollPanel';

/**
 * A single show/hide panel on Radix Collapsible — the one-panel sibling of
 * Accordion. Unstyled apart from the open/close slide, so the caller owns
 * the trigger and panel look.
 *
 * `keepMounted`: Radix renders `isOpen && children` inside its Content, so
 * a closed panel's children are unmounted even with `forceMount`. That
 * drops react-final-form fields (their values and validation unregister)
 * and any other state inside the panel. With `keepMounted` the children
 * stay mounted and are only `hidden` while closed — what react-bootstrap's
 * Accordion/Collapse did. It slides too, by transitioning grid rows
 * (0fr ↔ 1fr) rather than Radix's measured height — see KeptMountedPanel.
 */
interface CollapsibleContextValue {
  open: boolean;
  keepMounted: boolean;
  contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue>(null);

export interface CollapsibleProps extends ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Root
> {
  /** Keep the panel's children mounted (hidden) while closed. */
  keepMounted?: boolean;
}

export const Collapsible = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      keepMounted = false,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = openProp ?? uncontrolledOpen;
    const contentId = useId();

    const handleOpenChange = (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    return (
      <CollapsibleContext.Provider value={{ open, keepMounted, contentId }}>
        <CollapsiblePrimitive.Root
          ref={ref}
          open={open}
          onOpenChange={handleOpenChange}
          {...props}
        />
      </CollapsibleContext.Provider>
    );
  },
);
Collapsible.displayName = 'Collapsible';

export const CollapsibleTrigger = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>((props, ref) => {
  const { open, keepMounted, contentId } = useContext(CollapsibleContext);
  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      // Radix only points aria-controls at its Content while open, because
      // that is when it exists. A kept-mounted panel always exists.
      aria-controls={open || keepMounted ? contentId : undefined}
      {...props}
    />
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export const CollapsibleContent = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Content>,
  ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, onScroll, ...props }, ref) => {
  const { open, keepMounted, contentId } = useContext(CollapsibleContext);

  if (keepMounted) {
    return (
      <KeptMountedPanel
        ref={ref}
        id={contentId}
        open={open}
        className={className}
        onScroll={onScroll}
        {...props}
      >
        {children}
      </KeptMountedPanel>
    );
  }

  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      id={contentId}
      data-waldur-animated=""
      onScroll={(event) => {
        unscrollPanel(event);
        onScroll?.(event);
      }}
      // No overflow-hidden here: the keyframes clip only while animating,
      // so an open panel lets a select's menu overflow it.
      className={cn(
        'data-[state=open]:animate-[waldur-collapsible-down_250ms_ease-out]',
        'data-[state=closed]:animate-[waldur-collapsible-up_250ms_ease-out]',
        className,
      )}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Content>
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

// Matches the Radix path's waldur-collapsible-down/-up keyframes.
const SLIDE_MS = 250;

type SlidePhase = 'closed' | 'entering' | 'opening' | 'open' | 'closing';

/**
 * The `keepMounted` panel: children stay mounted while closed, so Radix's
 * Presence-driven keyframes don't apply. It slides by transitioning grid
 * rows between 0fr and 1fr around an overflow-hidden inner box, which needs
 * no height measurement.
 *
 * - closed: `hidden`, so the folded content is out of the tab order and the
 *   accessibility tree, as before.
 * - entering → opening: unhidden at 0fr, a forced layout read commits that
 *   as the transition's start value, then 1fr — all before paint, and
 *   without waiting for a frame (requestAnimationFrame never fires in a
 *   background tab, which would stall the panel half-open).
 * - open: clipping lifted, so an inline select menu can overflow the panel.
 * - closing: back to 0fr, then `hidden` once the slide has run.
 */
const KeptMountedPanel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & { open: boolean; children: ReactNode }
>(({ open, className, children, ...props }, ref) => {
  const [phase, setPhase] = useState<SlidePhase>(open ? 'open' : 'closed');
  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => panelRef.current);

  useLayoutEffect(() => {
    if (open) {
      if (phase === 'open' || phase === 'opening') return;
      if (phase !== 'entering') {
        setPhase('entering');
        return;
      }
      // Reading layout makes the browser apply the unhidden 0fr state now,
      // so switching to 1fr next is a change the transition can animate.
      void panelRef.current?.offsetHeight;
      setPhase('opening');
      return;
    }
    if (phase === 'closed' || phase === 'closing') return;
    setPhase('closing');
  }, [open, phase]);

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return;
    const timer = setTimeout(
      () => setPhase(phase === 'opening' ? 'open' : 'closed'),
      SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [phase]);

  const expanded = phase === 'opening' || phase === 'open';

  return (
    <div
      ref={panelRef}
      data-state={open ? 'open' : 'closed'}
      hidden={phase === 'closed'}
      className={cn(
        // One column that may shrink below its content's min-content width
        // (minmax(0, 1fr), plus min-w-0 on the item): a grid track is
        // otherwise sized to fit it, so a wide table inside would widen the
        // panel instead of scrolling in its own wrapper.
        'grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows] duration-[250ms] ease-out motion-reduce:transition-none',
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
      {...props}
    >
      <div
        className={cn('min-h-0 min-w-0', phase !== 'open' && 'overflow-hidden')}
        onScroll={unscrollPanel}
      >
        {children}
      </div>
    </div>
  );
});
KeptMountedPanel.displayName = 'KeptMountedPanel';
