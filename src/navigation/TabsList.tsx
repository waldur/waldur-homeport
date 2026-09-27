/* eslint-disable jsx-a11y/anchor-is-valid */
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  UISrefActive,
  UISrefProps,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import classNames from 'classnames';
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

import { Tooltip } from 'waldur-ui';

import { Link } from '@/core/Link';
import {
  NavMenu,
  NavMenuContent,
  NavMenuItem,
  useHoverMenu,
} from '@/navigation/NavMenu';
import { getTabbableAfter } from '@/navigation/tabbables';

import { isDescendantOf, useTabs } from './useTabs';

const MenuLink: FC<
  UISrefProps & { className?: string; disabled?: boolean }
> = ({ to, params, disabled, children, className }) =>
  to && !disabled ? (
    <Link
      state={to}
      params={params}
      className={classNames('menu-link', className)}
    >
      {children}
    </Link>
  ) : (
    <a className={classNames('menu-link', disabled && 'disabled', className)}>
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
  const { open, setOpen, hoverHandlers, triggerHandlers } = useHoverMenu();
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
    <NavMenu open={open} onOpenChange={setOpen} modal={false}>
      <span
        data-testid={tabTestId(parentTab)}
        className={classNames('menu-item me-0 me-lg-2', { here: active })}
      >
        <RadixDropdownMenu.Trigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className="menu-link"
            {...triggerHandlers}
          >
            <span className="menu-title">{parentTab.title}</span>
            <span className="menu-arrow" />
          </button>
        </RadixDropdownMenu.Trigger>
      </span>
      <NavMenuContent
        placement="bottom-start"
        className="menu-gray-600 menu-state-bg-gray menu-rounded-0 menu-dropdown-default fw-bolder fs-6 py-2 w-200px"
        onKeyDown={handleContentKeyDown}
        onCloseAutoFocus={handleCloseAutoFocus}
        {...hoverHandlers}
      >
        {parentTab.children.map((childTab, childIndex) => (
          <UISrefActive class="active" key={childIndex}>
            <NavMenuItem asChild>
              <Link state={childTab.to} params={childTab.params}>
                <span className="menu-title">{childTab.title}</span>
              </Link>
            </NavMenuItem>
          </UISrefActive>
        ))}
      </NavMenuContent>
    </NavMenu>
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
          <span
            key={parentIndex}
            data-testid={tabTestId(parentTab)}
            className={classNames('menu-item text-nowrap', {
              here: isMatch(activeTab, parentTab),
            })}
          >
            <MenuLink
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
              disabled={parentTab.disabled}
            >
              {/* A disabled tab must say why it is unavailable. The tooltip
                  sits inside the link because `.menu-link.disabled` keeps
                  pointer events, so the hover trigger still fires. */}
              {parentTab.disabled && parentTab.disabledReason ? (
                <Tooltip label={parentTab.disabledReason}>
                  <span className="menu-title">{parentTab.title}</span>
                </Tooltip>
              ) : (
                <span className="menu-title">{parentTab.title}</span>
              )}
            </MenuLink>
          </span>
        ) : null,
      )}
    </>
  );
};
