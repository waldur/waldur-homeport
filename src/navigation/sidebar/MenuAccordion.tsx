import * as Collapsible from '@radix-ui/react-collapsible';
import classNames from 'classnames';
import {
  CSSProperties,
  FC,
  PropsWithChildren,
  ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Tip } from '@/core/Tooltip';

interface MenuAccordionProps {
  title: ReactNode;
  itemId?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  child?: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
  /** Sibling-exclusivity, threaded from the enclosing group's shared
   * open-id state (see useExclusiveOpen in ./utils). Optional — omitted,
   * this falls back to Radix's own uncontrolled mode, so a standalone
   * `<MenuAccordion>` with no sibling group still works on its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Radix Collapsible, not Accordion: Accordion.Root renders its own wrapping
 * DOM element, and a nested Root (needed to coordinate "only one sibling
 * open" for ResourcesMenu's recursive categories) would insert an extra
 * <div> between .menu-sub-accordion and its .menu-item children — breaking
 * the indentation mixin's direct-child selector chain
 * (menu-link-indention, core/components/mixins/_menu.scss). Collapsible has
 * no group-level Root: each .menu-item.menu-accordion below is its own
 * Collapsible.Root via `asChild` (zero extra DOM), and sibling-exclusivity
 * is just the shared `open`/`onOpenChange` state passed in from above.
 *
 * Trigger takes `className="menu-link"` directly, not wrapped in a <span>
 * via `asChild` — this makes it a real <button>, which core SCSS is
 * already prepared for (`button.menu-link` reset block,
 * core/components/menu/_base.scss, added for exactly this kind of
 * keyboard-reachable trigger). Content takes the existing
 * `.menu-sub.menu-sub-accordion` classes unchanged; the open/close slide
 * animation and arrow rotation are bridged onto Radix's `[data-state]` in
 * custom/_aside.scss.
 *
 * Content deliberately uses Radix's *default* hidden-attribute-driven
 * mount/unmount (no `forceMount`) rather than a custom always-mounted
 * approach: `forceMount` was tried first, to sidestep a `[hidden]` CSS
 * fight (see custom/_aside.scss), but it silently breaks Radix's own
 * `--radix-collapsible-content-height` freshness — that var is only
 * re-measured on the real mount/unmount cycle `forceMount` disables, so
 * every open past the first used a stale (or entirely unset) height and
 * the slide animation stopped animating. Keeping the default toggling
 * costs an `!important` in the CSS instead (a narrower, better-understood
 * problem) rather than losing correct height measurement altogether.
 *
 * `--menu-accordion-height` (below) exists because Radix's own
 * `--radix-collapsible-content-height` turns out unreliable on exactly
 * the transition that matters most: the very first open of a given
 * mount. `CollapsibleContentImpl` (node_modules/@radix-ui/react-collapsible)
 * measures height into a plain `useRef`, not `useState` — updating a ref
 * doesn't trigger a re-render, so that measurement only ever reaches the
 * DOM if *something else* re-renders the component afterward. The only
 * candidate is its own `setIsPresent(present)` call in that same effect,
 * which is a no-op bailout the very first time (the state already equals
 * `present`, since `useState(present)` initialized to it) — so on a
 * fresh mount, the height var never gets attached to the DOM at all, and
 * the `@keyframes` below animate to an unset custom property, i.e. no
 * visible movement. Confirmed live via getAnimations(): a 250ms animation
 * completing in ~1-2ms on first open, but correctly over the full 250ms
 * on every open after (once something incidental has forced a second
 * render). Measuring `scrollHeight` ourselves — which reports the full
 * content height regardless of the element's own animated/constrained
 * `height`, so no extra "measure unconstrained" step is needed — into
 * real `useState` sidesteps the bug entirely, on every open, not just
 * the second one onward.
 */
export const MenuAccordion: FC<PropsWithChildren<MenuAccordionProps>> = (
  props,
) => {
  const { disabled = false, disabledTooltip, open, onOpenChange } = props;
  const generatedId = useId();
  const itemId = props.itemId ?? generatedId;

  // See the class-level comment above: bypasses
  // --radix-collapsible-content-height's unreliable-on-first-open bug by
  // measuring this ourselves, into real state (which re-renders), rather
  // than trusting Radix's own ref-based (silently non-re-rendering)
  // measurement.
  //
  // Deps `[open]`, not `[]`: MenuAccordion itself (unlike
  // Collapsible.Content) stays mounted across the whole open/closed
  // lifecycle — CallPublicMenu/ResourcesMenu always render it, toggling
  // just the `open` prop. An empty deps array runs this exactly once, on
  // *MenuAccordion's* mount, which happens while closed (before the
  // sidebar's ever been touched) — `contentRef.current` is null at that
  // one and only run, the early return fires, and the ResizeObserver
  // this sets up never happens at all, for the component's entire
  // lifetime. Re-running whenever `open` changes re-attaches it to
  // whatever real node exists (or bails cleanly when there isn't one).
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>();
  // One ResizeObserver instance for the component's whole lifetime, not a
  // fresh one per toggle: `[open]` still has to re-run this effect every
  // time (see above), but the DOM node it needs to watch is the only thing
  // that actually changes between runs -- re-pointing the same observer at
  // it with observe()/unobserve() avoids reallocating the observer itself
  // on every expand/collapse. The callback reads contentRef.current fresh
  // rather than closing over this run's `node`, so it can't fire against a
  // stale, already-unmounted target.
  const resizeObserverRef = useRef<ResizeObserver>(null);
  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setContentHeight(node.scrollHeight);
    resizeObserverRef.current ??= new ResizeObserver(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    });
    const observer = resizeObserverRef.current;
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [open]);
  const contentStyle =
    contentHeight !== undefined
      ? ({ '--menu-accordion-height': `${contentHeight}px` } as CSSProperties)
      : undefined;

  const headerContent = (
    <>
      {props.icon && (
        <span className="menu-icon">
          <span className="svg-icon svg-icon-2">{props.icon}</span>
        </span>
      )}
      {props.child && (
        <span className="menu-bullet">
          <span className="bullet bullet-dot" />
        </span>
      )}
      <span className="menu-title">{props.title}</span>
      {Boolean(props.badge) && (
        <span className="menu-badge">{props.badge}</span>
      )}
      {!disabled && <span className="menu-arrow" />}
    </>
  );

  const itemClassName = classNames('menu-item menu-accordion', {
    'menu-item-disabled': disabled,
  });

  const accordion = disabled ? (
    <div className={itemClassName} id={itemId}>
      <span className="menu-link">{headerContent}</span>
    </div>
  ) : (
    <Collapsible.Root asChild open={open} onOpenChange={onOpenChange}>
      <div className={itemClassName} id={itemId}>
        <Collapsible.Trigger className="menu-link">
          {headerContent}
        </Collapsible.Trigger>
        <Collapsible.Content
          ref={contentRef}
          className="menu-sub menu-sub-accordion menu-rounded-0"
          style={contentStyle}
        >
          {props.children}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tip label={disabledTooltip} id={`menu-accordion-${itemId}`}>
        {accordion}
      </Tip>
    );
  }

  return accordion;
};
