import { createContext, useContext, useEffect } from 'react';

interface Tab {
  title: string;
  to?: string;
  params?: Object;
  children?: Tab[];
}

export interface LayoutContextInterface {
  setActions(actions: React.ReactNode): void;
  tabs: Tab[];
  setTabs(tabs: Tab[]): void;
  extraTabs: Tab[];
  setExtraTabs(tabs: Tab[]): void;
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
export const useExtraTabs = (tabs: Tab[]) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setExtraTabs(tabs);
    return () => {
      layoutContext.setExtraTabs([]);
    };
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
