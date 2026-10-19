import {
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

/**
 * One crumb of a breadcrumb trail. `to` is whatever the app's router
 * navigates by (a UI-Router state name, a React Router path, ...), with
 * `params` if it takes any; the provider's `renderLink` turns the pair into a
 * link. Without a `renderLink`, `to` is a plain href.
 */
export interface IBreadcrumbItem {
  key: string;
  text: string;
  /** Opens in a popover from the crumb: a switcher, a search, a list. */
  dropdown?: ReactNode | ((close: () => void) => ReactNode);
  hideDropdownArrow?: boolean;
  /** The page the user is on: not a link, and middle-truncated to fit. */
  active?: boolean;
  to?: string;
  params?: object;
  /** Runs on click: alongside a link, or as a button crumb without one. */
  onClick?(): void;
  /** Caps the label at 320px with an ellipsis. */
  truncate?: boolean;
  /** Always shortens the label to this many characters, with a tooltip. */
  maxLength?: number;
  /** Title for a `truncate` label; defaults to the text. */
  tooltipText?: string;
}

/** Builds the app's router link for a crumb's `to` and `params`. */
export type BreadcrumbLinkRenderer = (
  to: string,
  params?: object,
) => ReactElement;

const ItemsContext = createContext<IBreadcrumbItem[]>([]);

// Separate from the items so the setter's context never changes: a page's
// useBreadcrumbs effect would otherwise re-run on every update it caused.
// A no-op default lets a page render without a provider (a unit test, an app
// with no trail) instead of crashing.
const SetItemsContext = createContext<(items: IBreadcrumbItem[]) => void>(
  () => {},
);

export const BreadcrumbLinkRendererContext = createContext<
  BreadcrumbLinkRenderer | undefined
>(undefined);

interface BreadcrumbsProviderProps {
  renderLink?: BreadcrumbLinkRenderer;
}

/**
 * Holds the current page's crumbs: pages set them with useBreadcrumbs, the
 * header reads them with useBreadcrumbItems (BreadcrumbTrail does by default).
 */
export const BreadcrumbsProvider: FC<
  PropsWithChildren<BreadcrumbsProviderProps>
> = ({ renderLink, children }) => {
  const [items, setItems] = useState<IBreadcrumbItem[]>([]);
  return (
    <SetItemsContext.Provider value={setItems}>
      <ItemsContext.Provider value={items}>
        <BreadcrumbLinkRendererContext.Provider value={renderLink}>
          {children}
        </BreadcrumbLinkRendererContext.Provider>
      </ItemsContext.Provider>
    </SetItemsContext.Provider>
  );
};

/**
 * Shows `items` as the trail while the calling page is mounted. Memoise them:
 * a new array each render re-sets the trail, which then re-measures.
 */
export const useBreadcrumbs = (items: IBreadcrumbItem[]) => {
  const setItems = useContext(SetItemsContext);
  useEffect(() => {
    setItems(items);
    return () => {
      setItems([]);
    };
  }, [items, setItems]);
};

/** The crumbs the current page set. */
export const useBreadcrumbItems = () => useContext(ItemsContext);
