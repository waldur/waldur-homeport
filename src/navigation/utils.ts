import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

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
    return tabs.map((tab) => ({
      title: tab.title,
      to: state.name,
      params: { tab: tab.key },
    }));
  }, [state, tabs]);
  useExtraTabs(mainTabs);

  const tabSpec = useMemo<PageBarTab>(() => {
    if (!tabs?.length) return null;
    let _tabSpec;
    if (params.tab) {
      _tabSpec = tabs.find((child) => child.key === params.tab);
    } else if (tabs) {
      const firstTabKey = tabs[0].children?.length
        ? tabs[0].children[0].key
        : tabs[0].key;
      _tabSpec = tabs.find((child) => child.key === firstTabKey);
    }
    return _tabSpec;
  }, [tabs, params?.tab]);

  return { tabSpec };
};
