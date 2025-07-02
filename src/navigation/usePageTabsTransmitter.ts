import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo, useEffect } from 'react';

import { useExtraTabs } from './context';
import { Tab } from './Tab';
import { PageBarTab } from './types';

export const usePageTabsTransmitter = (tabs: PageBarTab[]) => {
  const { state, params } = useCurrentStateAndParams();
  const mainTabs = useMemo<Tab[]>(() => {
    return tabs.map((tab) =>
      tab.children && !tab.component
        ? {
            title: tab.title,
            disabled: tab.disabled,
            visible: tab.visible,
            redirectTo: tab.defaultKey
              ? { state: state.name, params: { tab: tab.defaultKey } }
              : undefined,
            children: tab.children.map((child) => ({
              title: child.title,
              to: state.name,
              params: { tab: child.key },
              disabled: child.disabled,
              visible: child.visible,
            })),
          }
        : {
            title: tab.title,
            to: state.name,
            params: { tab: tab.key },
            disabled: tab.disabled,
            visible: tab.visible,
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
      // If invalid tab name is specified, use first tab instead
      return flatTabs.find((tab) => tab.key === params.tab) || flatTabs[0];
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
