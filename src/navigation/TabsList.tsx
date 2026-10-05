/* eslint-disable jsx-a11y/anchor-is-valid */
import { CaretDownIcon } from '@phosphor-icons/react';
import {
  UISrefActive,
  UISrefProps,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import { isMatch } from 'lodash-es';
import {
  FC,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn, Tooltip, Menu } from 'waldur-ui';

import { Link } from '@/core/Link';
import { NavMenuLink } from '@/navigation/NavMenu';
import { getTabbableAfter } from '@/navigation/tabbables';

import { isDescendantOf, useTabs } from './useTabs';

/**
 * A page tab, ported from Metronic's `.menu-link` in Toolbar.tsx's old
 * `menu-rounded menu-gray-500 menu-state-bg-light-primary` row: gray-500,
 * and brand text on a light brand background when hovered or current. The
 * current tab is marked with `aria-current`. The tab row scrolls, which
 * clips an outline drawn outside the tab, so the focus ring is inset; it
 * is hidden under a pointer because Radix focuses a menu trigger on hover
 * and some browsers treat that as :focus-visible.
 */
const TAB_CLASSNAME = cn(
  'group flex cursor-pointer items-center rounded-[6px] px-[12px] py-[8px] text-[var(--page-tab-text)] no-underline transition-colors duration-200',
  // tab-active: is defined in waldur-design-tokens/variants.css.
  'tab-active:bg-[var(--page-tab-active-bg)] tab-active:text-[var(--page-tab-active-text)]',
  'data-disabled:cursor-not-allowed data-disabled:text-[var(--menu-item-disabled-text)]',
  'focus-visible:rounded-lg focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)] hover:focus-visible:outline-none',
);

const TabLink: FC<UISrefProps & { current?: boolean; disabled?: boolean }> = ({
  to,
  params,
  current,
  disabled,
  children,
}) =>
  to && !disabled ? (
    <Link
      state={to}
      params={params}
      className={TAB_CLASSNAME}
      aria-current={current ? 'page' : undefined}
    >
      {children}
    </Link>
  ) : (
    <a className={TAB_CLASSNAME} data-disabled={disabled ? '' : undefined}>
      {children}
    </a>
  );

const tabTestId = (tab) => {
  const id = tab.params?.tab ?? tab.to;
  return id ? `tab-${id}` : undefined;
};

const findActiveTab = (tabs, router) => {
  const exactMatch = tabs.find(
    (parent) =>
      router.stateService.is(parent.redirectTo || parent.to, parent.params) ||
      parent.children?.find((child) =>
        router.stateService.is(child.to, child.params),
      ),
  );
  if (exactMatch) {
    return exactMatch;
  }
  // No page tab matches ?tab= — it is absent (routes declare `tab` with no
  // default) or names no tab — so the page renders its first shown tab
  // (usePageTabsTransmitter). Highlight that same tab rather than none, by the
  // same rule: skip hidden tabs and hidden children. Route tabs always match
  // exactly above, and tabs on other states are left to the descendant match.
  const onThisState = (to) => to && router.stateService.is(to);
  const fallbackTab = tabs.find(
    (tab) =>
      tab.visible !== false &&
      (onThisState(tab.to) ||
        tab.children?.some((c) => c.visible !== false && onThisState(c.to))),
  );
  if (fallbackTab) {
    return fallbackTab;
  }
  return tabs.find((parent) => {
    if (!isDescendantOf(parent.to, router.globals.current)) {
      return false;
    }
    return !tabs.some(
      (otherParent) =>
        otherParent !== parent &&
        isDescendantOf(otherParent.to, router.globals.current),
    );
  });
};

/**
 * The parent-tab-with-children case: a top-level trigger whose original
 * Metronic trigger config opened either an inline accordion (below `lg`)
 * on click or a floating dropdown (`lg`+) on hover, per Metronic's own
 * responsive CSS (`.menu-lg-down-accordion`,
 * `.menu-sub-down-accordion.menu-sub-dropdown`).
 *
 * Both modes collapse to the same Radix dropdown here. The trigger is a
 * plain button that only opens the menu (click, Enter, Space, ArrowDown,
 * or hover at `lg`+); it does not navigate, so every destination,
 * including the first, is a menu item (WCAG 2.1.1, no link nested in a
 * button).
 */
const TabWithChildren: FC<{ parentTab; active: boolean }> = ({
  parentTab,
  active,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tabTargetRef = useRef<HTMLElement | null>(null);

  // Radix menus swallow Tab. Treat the portaled menu as if it sat right
  // after its trigger: Tab closes it and moves on to the next header item,
  // Shift+Tab closes it and returns to the trigger.
  const handleContentKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    tabTargetRef.current =
      !event.shiftKey && triggerRef.current
        ? getTabbableAfter(triggerRef.current, event.currentTarget)
        : null;
    setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event) => {
    const target = tabTargetRef.current;
    tabTargetRef.current = null;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <Menu open={open} onOpenChange={setOpen} openOnHover="desktop">
      <li
        data-testid={tabTestId(parentTab)}
        className="flex items-center me-0 me-lg-2"
      >
        <Menu.Trigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className={TAB_CLASSNAME}
            aria-current={active ? 'true' : undefined}
          >
            {parentTab.title}
            {/* gray-500, brand while the tab is hovered, current or open;
                flips to point up while open. */}
            <CaretDownIcon
              size={16.9}
              weight="bold"
              className="ms-[8px] shrink-0 text-[var(--page-tab-text)] transition-[rotate] duration-300 group-hover:text-[var(--page-tab-caret-active)] group-aria-[current]:text-[var(--page-tab-caret-active)] group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--page-tab-caret-active)]"
            />
          </button>
        </Menu.Trigger>
      </li>
      <Menu.Content
        align="start"
        className="fw-bolder fs-6 py-2 w-200px"
        onKeyDown={handleContentKeyDown}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {parentTab.children.map((childTab, childIndex) => (
          <UISrefActive class="active" key={childIndex}>
            <NavMenuLink
              state={childTab.to}
              params={childTab.params}
              label={childTab.title}
            />
          </UISrefActive>
        ))}
      </Menu.Content>
    </Menu>
  );
};

export const TabsList: FC = () => {
  const tabs = useTabs();
  const router = useRouter();
  const updateActiveTab = useCallback(
    () => setActiveTab(findActiveTab(tabs, router)),
    [tabs, router],
  );
  const [activeTab, setActiveTab] = useState();
  useEffect(updateActiveTab, [tabs, router]);
  useOnStateChanged(updateActiveTab);

  const visibleTabs = useMemo(() => {
    const _tabs = tabs.filter((tab) => tab.visible !== false);
    return _tabs.map((tab) =>
      tab.children?.length
        ? {
            ...tab,
            children: tab.children.filter((child) => child.visible !== false),
          }
        : tab,
    );
  }, [tabs]);

  return (
    <>
      {visibleTabs.map((parentTab, parentIndex) =>
        parentTab.children?.length > 0 ? (
          <TabWithChildren
            key={parentIndex}
            parentTab={parentTab}
            active={isMatch(activeTab, parentTab)}
          />
        ) : parentTab.to || parentTab.redirectTo ? (
          <li
            key={parentIndex}
            data-testid={tabTestId(parentTab)}
            className="flex items-center text-nowrap"
          >
            <TabLink
              to={
                (typeof parentTab.redirectTo === 'string'
                  ? parentTab.redirectTo
                  : parentTab.redirectTo?.state) || parentTab.to
              }
              params={
                (typeof parentTab.redirectTo === 'object'
                  ? parentTab.redirectTo.params
                  : undefined) || parentTab.params
              }
              current={isMatch(activeTab, parentTab)}
              disabled={parentTab.disabled}
            >
              {/* A disabled tab must say why it is unavailable. The tooltip
                  sits inside the link, which keeps pointer events, so the
                  hover trigger still fires. The label is a span so Link
                  doesn't give it its `text-anchor` style. */}
              {parentTab.disabled && parentTab.disabledReason ? (
                <Tooltip label={parentTab.disabledReason}>
                  <span>{parentTab.title}</span>
                </Tooltip>
              ) : (
                <span>{parentTab.title}</span>
              )}
            </TabLink>
          </li>
        ) : null,
      )}
    </>
  );
};
