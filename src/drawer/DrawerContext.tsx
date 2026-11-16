import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
  useLayoutEffect,
} from 'react';

import {
  DOCKED_MIN_WIDTH,
  dockKey,
  readStoredDocked,
  storeDocked,
} from './drawerDock';
import { rememberOpenDrawer } from './drawerRestore';
import { DRAWER_MIN_WIDTH, readStoredDrawerWidth } from './drawerWidth';
import { DrawerShellClass } from './shellClasses';

export interface DrawerProps {
  title?: React.ReactNode;
  subtitle?: string;
  footer?: ComponentType<any>;
  toolbar?: ComponentType<{ close: () => void }>;
  width?: string;
  /** Opens the drawer as one of the floating cards (see shellClasses.ts). */
  shellClass?: DrawerShellClass;
  /**
   * The user can drag the drawer's left edge to resize it (from lg); on by
   * default. The width is remembered per `shellClass`; a drawer without one
   * keeps it only while open.
   */
  resizable?: boolean;
  /** Narrowest the user can drag it to, in px (DRAWER_MIN_WIDTH by default). */
  minWidth?: number;
  /**
   * Whether the drawer opens docked beside the page rather than floating
   * over it, until the user chooses for this kind of drawer (its
   * `shellClass`). See the context's `docked`.
   */
  docked?: boolean;
  [key: string]: any;
}

interface DrawerContextValue {
  isOpen: boolean;
  drawerComponent: ComponentType<any> | null;
  drawerProps: any;
  /** The expand ("full screen") toggle's state; reset when a drawer opens. */
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  /**
   * The width the user dragged the drawer to, in px, or null for
   * `drawerProps.width`. Restored from storage when a resizable drawer opens.
   */
  width: number | null;
  setWidth: (width: number | null) => void;
  /**
   * A resizable drawer from lg is wide enough for the expanded layout
   * (DRAWER_WIDE_WIDTH), whether expanded or dragged that wide. Kept by
   * DrawerRoot; read through useDrawerWide.
   */
  wide: boolean;
  setWide: (wide: boolean) => void;
  /**
   * The user's choice to dock the drawer beside the page: the page stays
   * usable, clicking it or going to another page leaves the drawer open, and
   * the page narrows to make room for it. It holds from lg while the page
   * keeps DOCK_MIN_PAGE_WIDTH beside it (DrawerRoot); otherwise the drawer
   * floats over the page. Remembered per kind of drawer.
   */
  docked: boolean;
  setDocked: (docked: boolean) => void;
  /**
   * Docked and actually beside the page, which it narrows (DrawerRoot): the
   * sidebar collapses to its rail then, at any width.
   */
  besidePage: boolean;
  setBesidePage: (besidePage: boolean) => void;
  /** The AI chat history sidebar below lg; reset when a drawer opens. */
  historyOpen: boolean;
  setHistoryOpen: (historyOpen: boolean) => void;
  /**
   * The drawer panel while mounted, for a menu that must portal inside the
   * dialog's focus scope.
   */
  panel: HTMLElement | null;
  setPanel: (panel: HTMLElement | null) => void;
  openDrawer: <T>(component: ComponentType<T>, props?: T & DrawerProps) => void;
  closeDrawer: () => void;
  renderDrawer: <T>(
    component: ComponentType<T>,
    props?: T & DrawerProps,
  ) => void;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * The open state and shell class for code outside React (stream callbacks,
 * effects comparing against the drawer that is showing), kept by
 * DrawerProvider once each change commits (before any effect reads it).
 */
export const drawerState: {
  isOpen: boolean;
  shellClass?: DrawerShellClass;
  /** Docked beside the page now (DrawerRoot): it stays open on navigation. */
  docked?: boolean;
} = {
  isOpen: false,
};

// Global reference for DrawerService to use outside of React tree
export let drawerServiceRef: Pick<
  DrawerContextValue,
  'openDrawer' | 'closeDrawer' | 'renderDrawer'
> | null = null;

const DEFAULT_DRAWER_PROPS: DrawerProps = {
  width: '800px',
  resizable: true,
};

/** Whether a drawer opens docked: as last chosen, else as it asks. */
const getOpeningDocked = (props?: DrawerProps): boolean =>
  readStoredDocked(dockKey(props?.shellClass)) ?? Boolean(props?.docked);

/** The width a drawer opens at: the one last dragged to, if it has one. */
const getOpeningWidth = (props?: DrawerProps): number | null =>
  props?.resizable === false
    ? null
    : readStoredDrawerWidth(
        props?.shellClass,
        // A docked drawer may have been left narrower than its own minimum;
        // DrawerRoot widens it back while it floats.
        Math.min(props?.minWidth ?? DRAWER_MIN_WIDTH, DOCKED_MIN_WIDTH),
      );

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerComponent, setDrawerComponent] =
    useState<ComponentType<any> | null>(null);
  const [drawerProps, setDrawerProps] = useState<any>(DEFAULT_DRAWER_PROPS);
  const [expanded, setExpanded] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [wide, setWide] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [docked, setDockedState] = useState(false);
  const [besidePage, setBesidePage] = useState(false);
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  const openDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      setIsOpen(true);
      // Every drawer opens as a panel; closing keeps the expanded width
      // through the slide-out instead.
      setExpanded(false);
      setWidth(getOpeningWidth(props));
      setHistoryOpen(false);
      setDockedState(getOpeningDocked(props));
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
      rememberOpenDrawer(props?.shellClass);
    },
    [],
  );

  const setDocked = useCallback(
    (next: boolean) => {
      setDockedState(next);
      storeDocked(dockKey(drawerProps.shellClass), next);
    },
    [drawerProps.shellClass],
  );

  const closeDrawer = useCallback(() => {
    // Only a drawer that is open is forgotten: the first page's navigation
    // closes "the drawer" before any is open, which must not wipe the one to
    // restore (RestoreOpenDrawer).
    if (drawerState.isOpen) rememberOpenDrawer(undefined);
    setIsOpen(false);
    setDrawerComponent(null);
    // The shell class has to outlast the slide-out, or the card drops to the
    // default full-height panel over the page header while it leaves; and
    // so does whether it resizes, or a drawer that opted out would gain a
    // handle while it leaves.
    setDrawerProps((prev) => ({
      ...DEFAULT_DRAWER_PROPS,
      shellClass: prev.shellClass,
      resizable: prev.resizable,
    }));
  }, []);

  const renderDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      // Never overwrite an active open drawer with a background render call
      // unless that drawer is already displaying this component.
      if (isOpen && drawerComponent !== component) {
        return;
      }
      if (!isOpen) {
        setExpanded(false);
        setWidth(getOpeningWidth(props));
        setHistoryOpen(false);
        setDockedState(getOpeningDocked(props));
      }
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [isOpen, drawerComponent],
  );

  // Update the global refs
  drawerServiceRef = { openDrawer, closeDrawer, renderDrawer };
  useLayoutEffect(() => {
    drawerState.isOpen = isOpen;
    drawerState.shellClass = drawerProps.shellClass;
  }, [isOpen, drawerProps.shellClass]);

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        drawerComponent,
        drawerProps,
        openDrawer,
        closeDrawer,
        renderDrawer,
        expanded,
        setExpanded,
        width,
        setWidth,
        wide,
        setWide,
        historyOpen,
        setHistoryOpen,
        docked,
        setDocked,
        besidePage,
        setBesidePage,
        panel,
        setPanel,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
