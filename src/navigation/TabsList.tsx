/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  UISrefActive,
  UISrefProps,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import classNames from 'classnames';
import { isMatch } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Link } from '@waldur/core/Link';

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
          <span
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="bottom-start"
            className={classNames(
              'menu-item menu-lg-down-accordion menu-sub-lg-down-indention me-0 me-lg-2',
              { here: isMatch(activeTab, parentTab) },
            )}
            key={parentIndex}
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
            <div className="menu-sub menu-sub-down-accordion menu-sub-dropdown menu-state-bg-gray menu-rounded-0 menu-dropdown-default py-2 w-200px">
              {parentTab.children.map((childTab, childIndex) => (
                <UISrefActive class="showing" key={childIndex}>
                  <Link
                    state={childTab.to}
                    params={childTab.params}
                    className="menu-item"
                    data-kt-menu-trigger="click"
                  >
                    <span className="menu-link">
                      <span className="menu-title">{childTab.title}</span>
                    </span>
                  </Link>
                </UISrefActive>
              ))}
            </div>
          </span>
        ) : parentTab.to || parentTab.redirectTo ? (
          <span
            key={parentIndex}
            className={classNames('menu-item text-nowrap', {
              here: isMatch(activeTab, parentTab),
            })}
            data-kt-menu-trigger="click"
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
              <span className="menu-title">{parentTab.title}</span>
            </MenuLink>
          </span>
        ) : null,
      )}
    </>
  );
};
