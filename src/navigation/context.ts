import { createContext, useContext, useLayoutEffect } from 'react';

import { Tab } from './Tab';

/**
 * Page state Layout needs that is data, not markup. Content a page adds to
 * the chrome (hero, tab actions, filter bar, announcements) goes through
 * LayoutSlot instead (slots.tsx).
 */
export interface LayoutContextInterface {
  extraTabs: Tab[];
  setExtraTabs(tabs: Tab[]): void;
  fullPage: boolean;
  setFullPage(value: boolean): void;
}

const noop = () => {};

// The hooks below call their setter unconditionally, so a consumer rendered
// without a real LayoutContext.Provider (most commonly a unit test) gets
// no-op stubs instead of crashing on a bare `{}` default.
export const LayoutContext = createContext<Partial<LayoutContextInterface>>({
  extraTabs: [],
  setExtraTabs: noop,
  fullPage: false,
  setFullPage: noop,
});

// From a layout effect, so Layout takes the change in the same paint as the
// page that made it.

export const useExtraTabs = (tabs: Tab[]) => {
  const layoutContext = useContext(LayoutContext);
  useLayoutEffect(() => {
    layoutContext.setExtraTabs(tabs);
    return () => {
      layoutContext.setExtraTabs([]);
    };
  }, [tabs, layoutContext]);
};

export const useFullPage = () => {
  const layoutContext = useContext(LayoutContext);
  useLayoutEffect(() => {
    layoutContext.setFullPage(true);
    return () => {
      layoutContext.setFullPage(false);
    };
  }, [layoutContext]);
};
