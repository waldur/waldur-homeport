import * as Collapsible from '@radix-ui/react-collapsible';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode, useId } from 'react';

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
 */
export const MenuAccordion: FC<PropsWithChildren<MenuAccordionProps>> = (
  props,
) => {
  const { disabled = false, disabledTooltip, open, onOpenChange } = props;
  const generatedId = useId();
  const itemId = props.itemId ?? generatedId;

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
        <Collapsible.Content className="menu-sub menu-sub-accordion menu-rounded-0">
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
