import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

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
            disabledReason: tab.disabledReason,
            visible: tab.visible,
            redirectTo: tab.defaultKey
              ? { state: state.name, params: { tab: tab.defaultKey } }
              : undefined,
            children: tab.children.map((child) => ({
              title: child.title,
              to: state.name,
              params: { tab: child.key },
              disabled: child.disabled,
              disabledReason: child.disabledReason,
              visible: child.visible,
            })),
          }
        : {
            title: tab.title,
            to: state.name,
            params: { tab: tab.key },
            disabled: tab.disabled,
            disabledReason: tab.disabledReason,
            visible: tab.visible,
          },
    );
  }, [state.name, tabs]);
  useExtraTabs(mainTabs);

  const flatTabs = useMemo(
    () =>
      tabs
        .flatMap((tab) => (tab.component ? [tab] : tab.children))
        .filter(Boolean),
    [tabs],
  );

  // The tab rendered when the URL names none, or names one that does not
  // exist: the first one the tab bar shows, so the content and the highlighted
  // tab agree. A hidden tab can still be opened by its key, which is how a
  // parent without visible children reaches its `defaultKey`.
  const fallbackTab = useMemo(
    () =>
      tabs
        .filter((tab) => tab.visible !== false)
        .flatMap((tab) => (tab.component ? [tab] : tab.children))
        .find((tab) => tab && tab.visible !== false) || flatTabs[0],
    [tabs, flatTabs],
  );

  const tabSpec = useMemo<PageBarTab>(() => {
    if (!flatTabs?.length) {
      return null;
    } else if (params.tab) {
      return flatTabs.find((tab) => tab.key === params.tab) || fallbackTab;
    } else {
      return fallbackTab;
    }
  }, [flatTabs, fallbackTab, params?.tab]);

  return { tabSpec };
};
