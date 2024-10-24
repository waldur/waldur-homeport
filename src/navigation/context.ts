import {
  DependencyList,
  ReactNode,
  createContext,
  useContext,
  useEffect,
} from 'react';

import { Tab } from './Tab';
import { IBreadcrumbItem } from './types';

export interface LayoutContextInterface {
  setActions(actions: React.ReactNode): void;
  extraTabs: Tab[];
  setExtraTabs(tabs: Tab[]): void;
  fullPage: boolean;
  setFullPage(value: boolean): void;
  setExtraToolbar(component: React.ReactNode);
  setPageHero(component: React.ReactNode);
  setPageBar(component: React.ReactNode);
  breadcrumbs: IBreadcrumbItem[];
  setBreadcrumbs(items: IBreadcrumbItem[]);
}

export const LayoutContext = createContext<Partial<LayoutContextInterface>>({});

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

export const useExtraToolbar = (
  component: ReactNode,
  deps: DependencyList = [],
) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setExtraToolbar(component);
    return () => {
      layoutContext.setExtraToolbar(null);
    };
  }, [layoutContext, ...deps]);
};

export const usePageHero = (
  component: ReactNode,
  deps: DependencyList = [],
) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setPageHero(component);
    return () => {
      layoutContext.setPageHero(null);
    };
  }, [layoutContext, ...deps]);
};

export const useToolbarActions = (
  component: ReactNode,
  deps: DependencyList = [],
) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setActions(component);
    return () => {
      layoutContext.setActions(null);
    };
  }, [layoutContext, ...deps]);
};

export const useBreadcrumbs = (items: IBreadcrumbItem[]) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setBreadcrumbs(items);
    return () => {
      layoutContext.setBreadcrumbs([]);
    };
  }, [items, layoutContext]);
};
