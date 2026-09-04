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
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import {
  NavMenu,
  NavMenuContent,
  NavMenuItem,
  useHoverMenu,
} from '@/navigation/NavMenu';

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
 * Both modes collapse to the same Radix dropdown here — a deliberate
 * simplification, not an overlooked one. Metronic's own imperative menu
 * JS never called `preventDefault()` on this trigger (confirmed in its
 * `_click` handler before that file was deleted — the line was
 * commented out, not missing), and Link's own onClick always fires its
 * state transition regardless, so clicking this row today already
 * navigates away immediately in the common case (parentTab always
 * carries its own `to`/`redirectTo`) — remounting the whole tree and
 * making whatever the accordion was doing under it invisible in
 * practice. Reproducing a true
 * inline-accordion mode here would faithfully replicate a mode nothing
 * can actually observe; a single hover-capable Radix dropdown (matching
 * FooterDropdown.tsx's own identical original attribute value) is both
 * simpler and already what `lg`+ users see today.
 */
export const TabWithChildren: FC<{ parentTab; active: boolean }> = ({
  parentTab,
  active,
}) => {
  const { open, setOpen, hoverHandlers } = useHoverMenu();

  return (
    <NavMenu open={open} onOpenChange={setOpen} modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <span
          className={classNames('menu-item me-0 me-lg-2', { here: active })}
          {...hoverHandlers}
        >
          <MenuLink
            to={
              (typeof parentTab.redirectTo === 'string'
                ? parentTab.redirectTo
                : parentTab.redirectTo?.state) || parentTab.to
            }
            params={
              typeof parentTab.redirectTo === 'object'
                ? parentTab.redirectTo.params
                : undefined
            }
          >
            <span className="menu-title">{parentTab.title}</span>
            <span className="menu-arrow" />
          </MenuLink>
        </span>
      </RadixDropdownMenu.Trigger>
      <NavMenuContent
        placement="bottom-start"
        className="menu-gray-600 menu-state-bg-gray menu-rounded-0 menu-dropdown-default fw-bolder fs-6 py-2 w-200px"
        {...hoverHandlers}
      >
        {parentTab.children.map((childTab, childIndex) => (
          <UISrefActive class="showing" key={childIndex}>
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
                <Tip
                  id={`tab-disabled-reason-${parentIndex}`}
                  label={parentTab.disabledReason}
                >
                  <span className="menu-title">{parentTab.title}</span>
                </Tip>
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
