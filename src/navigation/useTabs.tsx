import {
  StateDeclaration,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { router } from '@waldur/router';
import store from '@waldur/store/store';

import { LayoutContext } from './context';
import { Tab } from './Tab';
import { getTitle } from './title';

export const isChild = (parent, child) =>
  parent &&
  child &&
  (child.parent == parent.name ||
    child.name.toString().startsWith(`${parent.name}.`));

export const isChildOf = (parentName: string, state: StateDeclaration) =>
  state.name.startsWith(`${parent.name}.`) || state.parent === parentName;

export const isDescendantOf = (parentName: string, state: StateDeclaration) =>
  isChildOf(parentName, state) ||
  (state.parent &&
    isDescendantOf(parentName, router.stateService.get(state.parent)));

const stateToTab = (state: StateDeclaration) => ({
  title: state.data.breadcrumb(),
  to: state.name,
  params: {},
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

const filterState = (parent, child) =>
  isFeatureVisible(child.data?.feature) &&
  isChild(parent, child) &&
  child.data?.breadcrumb &&
  !child.data?.skipBreadcrumb &&
  (!child.data?.permissions ||
    child.data.permissions.every((permission) => permission(store.getState())));

export const getTabs = (root, allStates) =>
  sortStates(allStates.filter((state) => filterState(root, state))).map(
    (parent) => ({
      ...stateToTab(parent),
      children: sortStates(
        allStates.filter((child) => filterState(parent, child)),
      ).map(stateToTab),
    }),
  );

export const useTabs = (): Tab[] => {
  const router = useRouter();
  const [tabs, setTabs] = useState([]);
  const pageTitle = useSelector(getTitle);
  const syncTabs = () => {
    const allStates = router.stateRegistry.get();
    const current = router.globals.$current;
    if (!current.data.useExtraTabs) {
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
    document.title =
      ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE +
      ' | ' +
      (breadcrumb || pageTitle);
  };
  const { extraTabs } = useContext(LayoutContext);
  useEffect(syncTabs, [pageTitle]);
  useEffectOnce(syncTabs);
  useOnStateChanged(syncTabs);
  return extraTabs?.length > 0 ? extraTabs : tabs;
};
