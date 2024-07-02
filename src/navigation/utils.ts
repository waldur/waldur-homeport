import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, useMemo } from 'react';

import { router } from '@waldur/router';

import { useExtraTabs } from './context';
import { Tab } from './Tab';
import { PageBarTab } from './types';

let state;
let params;

export function setPrevState(newState) {
  state = newState;
}

export function setPrevParams(newParams) {
  params = newParams;
}

export const goBack = () => {
  if (state && state.name && state.name !== 'errorPage.notFound') {
    router.stateService.go(state.name, params);
  } else {
    router.stateService.go('profile.details');
  }
};

export const usePageTabsTransmitter = (tabs: PageBarTab[]) => {
  const { state, params } = useCurrentStateAndParams();
  const mainTabs = useMemo<Tab[]>(() => {
    return tabs.map((tab) =>
      tab.children
        ? {
            title: tab.title,
            children: tab.children.map((child) => ({
              title: child.title,
              to: state.name,
              params: { tab: child.key },
            })),
          }
        : {
            title: tab.title,
            to: state.name,
            params: { tab: tab.key },
          },
    );
  }, [state, tabs]);
  useExtraTabs(mainTabs);

  const flatTabs = useMemo(
    () => tabs.flatMap((tab) => (tab.component ? [tab] : tab.children)),
    [tabs],
  );

  const tabSpec = useMemo<PageBarTab>(() => {
    if (!flatTabs?.length) {
      return null;
    } else if (params.tab) {
      return flatTabs.find((tab) => tab.key === params.tab);
    } else {
      return flatTabs[0];
    }
  }, [tabs, params?.tab]);

  const router = useRouter();
  useEffect(() => {
    if (!params?.tab && tabSpec) {
      router.stateService.go(
        state,
        { ...params, tab: tabSpec.key },
        { location: 'replace' },
      );
    }
  }, [router, tabSpec, state, params?.tab]);

  return { tabSpec };
};
