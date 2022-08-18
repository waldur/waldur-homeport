import { createContext, useContext, useEffect } from 'react';

interface Tab {
  title: string;
  to?: string;
  children?: Tab[];
}

export interface LayoutContextInterface {
  setActions(actions: React.ReactNode): void;
  tabs: Tab[];
  setTabs(tabs: Tab[]): void;
  fullPage: boolean;
  setFullPage(value: boolean): void;
}

export const LayoutContext = createContext<Partial<LayoutContextInterface>>({});

export const useTabs = (tabs: Tab[]) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setTabs(tabs);
  }, [tabs, layoutContext]);
};

export const useFullPage = () => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setFullPage(true);
    return () => {
      layoutContext.setFullPage(false);
    };
  }, [layoutContext]);
};
