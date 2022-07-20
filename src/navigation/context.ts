import { createContext, useContext, useEffect } from 'react';

interface Tab {
  title: string;
  to?: string;
  children?: Tab[];
}

export interface LayoutContextInterface {
  setActions(actions: React.ReactNode): void;
  setSidebarKey(sidebarKey: string): void;
  sidebarKey: string;
  tabs: Tab[];
  setTabs(tabs: Tab[]): void;
}

export const LayoutContext = createContext<Partial<LayoutContextInterface>>({});

export const useSidebarKey = (sidebarKey: string) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setSidebarKey(sidebarKey);
    return () => {
      layoutContext.setSidebarKey('');
    };
  }, [sidebarKey, layoutContext]);
};

export const useTabs = (tabs: Tab[]) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setTabs(tabs);
  }, [tabs, layoutContext]);
};
