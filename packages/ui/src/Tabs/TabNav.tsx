import { Slot } from '@radix-ui/react-slot';
import {
  cloneElement,
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { Tooltip } from '../Tooltip';

import {
  tabListVariants,
  tabScrollClassName,
  tabTriggerVariants,
} from './tabStyles';
import { useScrollActiveTabIntoView } from './useScrollActiveTabIntoView';

/** One tab of a `TabNav`. */
export interface TabNavItemDef {
  key: string;
  title: ReactNode;
  /**
   * The element the tab renders as, usually a router link
   * (`<Link state="…" params={…} />`): the tab stays a real anchor, so
   * middle-click, Ctrl/Cmd-click and the URL preview work. Its children are
   * replaced by `title`. Without it the tab is a `<button>`.
   */
  link?: ReactElement;
  /** Button tabs only: called on click, before `TabNav`'s `onSelect`. */
  onClick?: () => void;
  /** Marks the tab current, overriding the match against `activeKey`. */
  active?: boolean;
  disabled?: boolean;
  /** Shown on hover and focus, disabled tabs included. */
  tooltip?: ReactNode;
  className?: string;
  /** `data-testid` on the tab. */
  testId?: string;
}

export interface TabNavProps extends Omit<
  ComponentPropsWithoutRef<'nav'>,
  'onSelect' | 'children'
> {
  items: TabNavItemDef[];
  /** The current tab's key; an item's `active` overrides it. */
  activeKey?: string;
  /** Button tabs only: called with the key of the clicked tab. */
  onSelect?: (key: string) => void;
  listClassName?: string;
  /**
   * `false` drops the strip's own bottom line, for a strip in a card header
   * that already draws one.
   */
  bordered?: boolean;
  /** Scroll sideways inside a frame that keeps the active underline intact. */
  scrollable?: boolean;
  /** Classes for the scroll frame (layout such as `flex-grow-1`). */
  scrollClassName?: string;
}

/**
 * A tab bar whose panel is drawn elsewhere, usually by the router: a `<nav>`
 * of links (or buttons) marked with `aria-current`, not `role="tab"` with
 * orphan `aria-controls`. For panels held on the page, use `Tabs`.
 */
export const TabNav = forwardRef<HTMLElement, TabNavProps>(
  (
    {
      items,
      activeKey,
      onSelect,
      className,
      listClassName,
      bordered,
      scrollable,
      scrollClassName,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? translate('Tabs')}
      className={cn('w-full', className)}
      {...props}
    >
      <TabNavList
        className={listClassName}
        bordered={bordered}
        scrollable={scrollable}
        scrollClassName={scrollClassName}
      >
        {items.map((item) => (
          <TabNavItem
            key={item.key}
            item={item}
            current={
              item.active ?? (activeKey !== undefined && item.key === activeKey)
            }
            onSelect={onSelect}
          />
        ))}
      </TabNavList>
    </nav>
  ),
);
TabNav.displayName = 'TabNav';

interface TabNavListProps extends ComponentPropsWithoutRef<'ul'> {
  bordered?: boolean;
  scrollable?: boolean;
  scrollClassName?: string;
}

const TabNavList = ({
  className,
  children,
  bordered = true,
  scrollable,
  scrollClassName,
  ...props
}: TabNavListProps) => {
  const frameRef = useScrollActiveTabIntoView<HTMLDivElement>();
  const list = (
    <ul
      className={cn(
        'm-0 p-0 list-none',
        tabListVariants({ bordered, className }),
      )}
      {...props}
    >
      {children}
    </ul>
  );
  return scrollable ? (
    <div
      ref={frameRef}
      // Firefox makes any scroll box a Tab stop; the tabs themselves are
      // the stops, so keep the frame out of the order.
      tabIndex={-1}
      className={tabScrollClassName(scrollClassName)}
    >
      {list}
    </div>
  ) : (
    list
  );
};

const TabNavItem = ({
  item,
  current,
  onSelect,
}: {
  item: TabNavItemDef;
  current: boolean;
  onSelect?: (key: string) => void;
}) => {
  const { key, title, link, onClick, disabled, tooltip, className, testId } =
    item;
  const isLink = Boolean(link);

  const triggerClasses = cn(
    tabTriggerVariants({ className }),
    // Global `a { color }` rules are unlayered, so they beat the layered
    // utilities above; an anchor tab has to assert its colours with `!`.
    isLink &&
      'no-underline !text-[var(--tabs-text)] [&:not([aria-current]):not([aria-disabled=true]):hover]:!text-[var(--tabs-text-hover)] [&[aria-current]]:!text-[var(--tabs-text-active)] aria-disabled:!text-[var(--tabs-text-disabled)]',
    // An anchor cannot be `disabled`: take it out of the tab order and away
    // from the pointer, so neither a click nor Enter follows the link.
    isLink && disabled && 'pointer-events-none',
  );

  const shared = {
    'aria-disabled': disabled ? ('true' as const) : undefined,
    // A link names the current page; a button only switches what is shown,
    // so it is the current item of the set rather than a page.
    'aria-current': current
      ? isLink
        ? ('page' as const)
        : ('true' as const)
      : undefined,
    'data-testid': testId,
    className: triggerClasses,
  };

  const trigger = isLink ? (
    // No click handler on the link: a router `Link` given one turns into
    // role="button". The label sits in a span so a string title does not
    // pick up Metronic's `.text-anchor` (border, underline on hover).
    <Slot {...shared} tabIndex={disabled ? -1 : undefined}>
      {cloneElement(
        link,
        undefined,
        <span className="inline-flex items-center">{title}</span>,
      )}
    </Slot>
  ) : (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        onSelect?.(key);
      }}
      {...shared}
    >
      {title}
    </button>
  );

  const content = tooltip ? (
    <Tooltip label={tooltip}>
      {disabled ? (
        // Disabled buttons and pointer-events-none links get no hover; the
        // span does, so the tooltip still opens.
        // role="presentation" preserves the listitem hierarchy, while
        // tabIndex={0} makes the disabled tab reachable by keyboard.
        <span
          role="presentation"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="inline-flex cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring-color,var(--waldur-brand-600))] focus-visible:rounded-[var(--focus-ring-radius,6px)]"
        >
          {trigger}
        </span>
      ) : (
        trigger
      )}
    </Tooltip>
  ) : (
    trigger
  );

  // A plain list item: `role="none"` would leave the <ul> holding no list
  // items as far as assistive technology is concerned (axe `list`).
  return <li className="inline-flex">{content}</li>;
};
