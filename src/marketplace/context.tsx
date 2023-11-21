import { FC, createContext, useMemo, useState } from 'react';

import useScrollTracker from '@waldur/core/useScrollTracker';

interface Tab {
  key: string;
  title: string;
  priority?: number;
}

interface PageBarContextModel {
  tabs: Array<Tab>;
  addTabs(tabs: Tab[]): void;
  clearTabs(): void;
  visibleSectionId?: string;
}

export const PageBarContext = createContext<PageBarContextModel>({
  tabs: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTabs: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearTabs: () => {},
});

export const PageBarProvider: FC = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);

  const addTabs = (_tabs: Tab[]) => {
    const newTabs = _tabs.filter((t) => !tabs.some((t2) => t2.key === t.key));
    if (newTabs.length === 0) {
      return;
    }
    setTabs((prev) => {
      const renderedTabs = prev
        .concat(newTabs)
        .map((tab) => {
          const el = document.getElementById(tab.key);
          if (el) return { ...tab, priority: el.offsetTop };
          else return null;
        })
        .filter(Boolean);
      return renderedTabs.sort((a, b) => (a.priority > b.priority ? 1 : -1));
    });
  };

  const clearTabs = () => setTabs([]);

  const tabKeys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);

  const visibleSectionId = useScrollTracker({
    sectionIds: tabKeys,
    trackSide: 'bottom',
    offset: 100,
  });

  const value: PageBarContextModel = {
    tabs,
    addTabs,
    clearTabs,
    visibleSectionId,
  };

  return (
    <PageBarContext.Provider value={value}>{children}</PageBarContext.Provider>
  );
};
