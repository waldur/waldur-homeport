import { createContext, useContext, useEffect } from 'react';

export interface LayoutContextInterface {
  setActions?(actions: React.ReactNode): void;
  setSidebarClass?(sidebarClass: string): void;
  setSidebarKey?(sidebarKey: string): void;
  sidebarKey?: string;
}

export const LayoutContext = createContext<LayoutContextInterface>({});

export const useSidebarKey = (sidebarKey: string) => {
  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setSidebarKey(sidebarKey);
    return () => {
      layoutContext.setSidebarKey('');
    };
  }, [sidebarKey, layoutContext]);
};
