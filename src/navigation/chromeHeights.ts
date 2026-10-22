import { RefObject, useLayoutEffect } from 'react';

/**
 * Measured heights, in px, of the sticky chrome above the page content.
 * Each piece owns its own height (TopBar, the phone breadcrumb bar, the page
 * tabs, the filter bar, OutstandingBar); Layout only reads them back.
 */
export interface ChromeHeights {
  /** The impersonation bar (OutstandingBar), 0 without it. */
  pageBar: number;
  /** AppHeader. */
  header: number;
  /** The breadcrumb bar under the header on a phone, 0 without it. */
  breadcrumbBar: number;
  /** The page tabs and the filter bar under them, 0 without either. */
  pageTabs: number;
}

/**
 * The CSS variables Layout writes on <html>, so content inside Layout and
 * the drawers outside it can sit below the chrome:
 * - `--layout-page-bar-height`: where the header sticks.
 * - `--layout-header-height`: the header; the phone breadcrumb bar sticks
 *   below it, and the floating drawers hang from it (over that bar).
 * - `--layout-breadcrumb-bar-height`: the phone breadcrumb bar; the page tabs
 *   stick below it and the header.
 * - `--layout-sticky-top`: below everything that sticks, for sticky page
 *   content such as a form's or a category list's sidebar.
 */
export const getChromeVariables = ({
  pageBar,
  header,
  breadcrumbBar,
  pageTabs,
}: ChromeHeights): Record<string, string> => ({
  '--layout-page-bar-height': `${pageBar}px`,
  '--layout-header-height': `${header}px`,
  '--layout-breadcrumb-bar-height': `${breadcrumbBar}px`,
  '--layout-sticky-top': `${pageBar + header + breadcrumbBar + pageTabs}px`,
});

const heightOf = (ref: RefObject<HTMLElement>) =>
  ref.current?.offsetHeight ?? 0;

/**
 * Keeps getChromeVariables on <html> in step with the chrome's rendered
 * heights. `deps` are whatever adds, removes or moves a measured element.
 */
export const useChromeHeights = (
  refs: Record<keyof ChromeHeights, RefObject<HTMLElement>>,
  deps: unknown[],
) => {
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    let names: string[] = [];
    const update = () => {
      const variables = getChromeVariables({
        pageBar: heightOf(refs.pageBar),
        header: heightOf(refs.header),
        breadcrumbBar: heightOf(refs.breadcrumbBar),
        pageTabs: heightOf(refs.pageTabs),
      });
      names = Object.keys(variables);
      Object.entries(variables).forEach(([name, value]) =>
        root.setProperty(name, value),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    Object.values(refs).forEach(
      (ref) => ref.current && observer.observe(ref.current),
    );
    return () => {
      observer.disconnect();
      names.forEach((name) => root.removeProperty(name));
    };
  }, deps);
};
