import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
  useLayoutEffect,
} from 'react';

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
export const drawerState: { isOpen: boolean; shellClass?: DrawerShellClass } = {
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

/** The width a drawer opens at: the one last dragged to, if it has one. */
const getOpeningWidth = (props?: DrawerProps): number | null =>
  props?.resizable === false
    ? null
    : readStoredDrawerWidth(
        props?.shellClass,
        props?.minWidth ?? DRAWER_MIN_WIDTH,
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
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  const openDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      setIsOpen(true);
      // Every drawer opens as a panel; closing keeps the expanded width
      // through the slide-out instead.
      setExpanded(false);
      setWidth(getOpeningWidth(props));
      setHistoryOpen(false);
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [],
  );

  const closeDrawer = useCallback(() => {
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
        panel,
        setPanel,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
