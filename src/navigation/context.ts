import { createContext } from 'react';

interface LayoutContextInterface {
  setActions?(actions: React.ReactNode): void;
  setSidebarClass?(sidebarClass: string): void;
}

export const LayoutContext = createContext<LayoutContextInterface>({});
