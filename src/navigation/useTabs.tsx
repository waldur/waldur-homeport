import {
  StateDeclaration,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import { useContext, useEffect, useState } from 'react';
import { useEffectOnce } from 'react-use';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { router } from '@/router';
import store from '@/store/store';

import { LayoutContext } from './context';
import { setDocumentTitle } from './documentTitle';
import { Tab } from './Tab';
import { getTitle } from './title';

const isChild = (parent, child) =>
  parent &&
  child &&
  (child.parent == parent.name ||
    child.name.toString().startsWith(`${parent.name}.`));

const isChildOf = (parentName: string, state: StateDeclaration) =>
  state.name.startsWith(`${state.parent}.`) ||
  state.name.startsWith(`${parentName}.`) ||
  (parentName && state.parent === parentName);

export const isDescendantOf = (parentName: string, state: StateDeclaration) =>
  isChildOf(parentName, state) ||
  (state.parent &&
    isDescendantOf(parentName, router.stateService.get(state.parent)));

const stateToTab = (state: StateDeclaration) => ({
  title: state.data.breadcrumb(),
  to: state.name,
  params: {},
  redirectTo: state.redirectTo,
});

const sortStates = (states: StateDeclaration[]) => {
  const prioritized = states.filter((state) => state.data?.priority);
  const nonprioritized = states.filter((state) => !state.data?.priority);
  return [
    ...prioritized.sort((a, b) => a.data.priority - b.data.priority),
    ...nonprioritized.sort((a, b) =>
      a.data.breadcrumb().localeCompare(b.data.breadcrumb()),
    ),
  ];
};

const isAllowed = (state) =>
  isFeatureVisible(state.data?.feature) &&
  (!state.data?.permissions ||
    state.data.permissions.every((permission) => permission(store.getState())));

const filterState = (parent, child) =>
  isChild(parent, child) &&
  child.data?.breadcrumb &&
  !child.data?.skipBreadcrumb &&
  isAllowed(child);

/**
 * A group with children is a dropdown and never navigates itself. Left with no
 * child to show, it turns into a plain link to its `redirectTo` — so when that
 * page is closed to the user too, the group leads nowhere but the
 * access-denied page and is dropped instead.
 */
const leadsSomewhere = (tab, allStates) => {
  if (tab.children.length > 0 || !tab.redirectTo) {
    return true;
  }
  const targetName =
    typeof tab.redirectTo === 'string' ? tab.redirectTo : tab.redirectTo.state;
  const target = allStates.find((state) => state.name === targetName);
  return !target || isAllowed(target);
};

export const getTabs = (root, allStates) =>
  sortStates(allStates.filter((state) => filterState(root, state)))
    .map((parent) => ({
      ...stateToTab(parent),
      children: sortStates(
        allStates.filter((child) => filterState(parent, child)),
      ).map(stateToTab),
    }))
    .filter((tab) => leadsSomewhere(tab, allStates));

export const useTabs = (): Tab[] => {
  const router = useRouter();
  const [tabs, setTabs] = useState([]);
  const pageTitle = getTitle();
  const syncTabs = () => {
    const allStates = router.stateRegistry.get();
    const current = router.globals.$current;
    if (current.data?.hideHeaderMenu) {
      setTabs([]);
    } else if (!current.data?.useExtraTabs) {
      const root = current.path.find((part) => part.data?.title);
      setTabs(getTabs(root, allStates));
    } else {
      setTabs([]);
    }
    let breadcrumb = current.data?.breadcrumb
      ? current.data?.breadcrumb()
      : undefined;
    if (Array.isArray(breadcrumb)) {
      breadcrumb = breadcrumb.join(' > ');
    }
    setDocumentTitle(
      ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE +
        ' | ' +
        (breadcrumb || pageTitle),
    );
  };
  const { extraTabs } = useContext(LayoutContext);
  useEffect(syncTabs, [pageTitle]);
  useEffectOnce(syncTabs);
  useOnStateChanged(syncTabs);
  return extraTabs?.length > 0 ? extraTabs : tabs;
};
