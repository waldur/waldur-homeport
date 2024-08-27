import {
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
  useMemo,
  useState,
} from 'react';

import useScrollTracker from '@waldur/core/useScrollTracker';

export interface PageBarTab {
  key: string;
  title: ReactNode;
  priority?: number;
  state?: string;
  params?: any;
  children?: Omit<PageBarTab, 'children'>[];
}

interface PageBarContextModel {
  tabs: Array<PageBarTab>;
  addTabs(tabs: PageBarTab[]): void;
  clearTabs(): void;
  visibleSectionId?: string;
}

interface PageBarProviderProps {
  scrollTrackSide?: 'top' | 'bottom';
  /** Distance from top or bottom to detect sections - in px */
  scrollOffset?: number;
}

export const PageBarContext = createContext<PageBarContextModel>({
  tabs: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTabs: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearTabs: () => {},
});

export const PageBarProvider: FC<PropsWithChildren<PageBarProviderProps>> = ({
  children,
  scrollOffset = 100,
  scrollTrackSide = 'bottom',
}) => {
  const [tabs, setTabs] = useState<PageBarTab[]>([]);

  const addTabs = (_tabs: PageBarTab[]) => {
    if (!_tabs.some((t) => !tabs.some((t2) => t2.key === t.key))) {
      return;
    }
    setTabs((prev) => {
      const newTabs = _tabs.filter((t) => !prev.some((t2) => t2.key === t.key));

      if (newTabs.length === 0) {
        return prev;
      }

      const renderedTabs = prev
        .concat(newTabs)
        .map((tab) => {
          const el = document.getElementById(tab.key);
          if (el) return { ...tab, priority: tab.priority || el.offsetTop };
          if (tab.children?.length) {
            for (const child of tab.children) {
              const childEl = document.getElementById(child.key);
              if (childEl)
                return { ...tab, priority: tab.priority || childEl.offsetTop };
            }
          } else return null;
        })
        .filter(Boolean);
      return renderedTabs.sort((a, b) => (a.priority > b.priority ? 1 : -1));
    });
  };

  const clearTabs = () => setTabs([]);

  const tabKeys = useMemo(() => {
    const keys = [];
    tabs.forEach((tab) => {
      keys.push(tab.key);
      if (tab.children?.length) {
        keys.push(...tab.children.map((child) => child.key));
      }
    });
    return keys;
  }, [tabs]);

  const visibleSectionId = useScrollTracker({
    sectionIds: tabKeys,
    trackSide: scrollTrackSide,
    offset: scrollOffset,
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
