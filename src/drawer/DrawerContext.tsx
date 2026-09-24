import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
} from 'react';

import { DrawerShellClass } from './shellClasses';

export interface DrawerProps {
  title?: React.ReactNode;
  subtitle?: string;
  footer?: ComponentType<any>;
  toolbar?: ComponentType<{ close: () => void }>;
  width?: string;
  /**
   * Rendered by DrawerRoot rather than added to #kt_drawer by hand: DrawerRoot
   * owns the element's className, and every re-render that changes it
   * (closing, for one) rewrites the whole attribute.
   */
  shellClass?: DrawerShellClass;
  [key: string]: any;
}

interface DrawerContextValue {
  isOpen: boolean;
  drawerComponent: ComponentType<any> | null;
  drawerProps: any;
  openDrawer: <T>(component: ComponentType<T>, props?: T & DrawerProps) => void;
  closeDrawer: () => void;
  renderDrawer: <T>(
    component: ComponentType<T>,
    props?: T & DrawerProps,
  ) => void;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

// Global reference for DrawerService to use outside of React tree
export let drawerServiceRef: Pick<
  DrawerContextValue,
  'openDrawer' | 'closeDrawer' | 'renderDrawer'
> | null = null;

const DEFAULT_DRAWER_PROPS: DrawerProps = {
  width: '800px',
};

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerComponent, setDrawerComponent] =
    useState<ComponentType<any> | null>(null);
  const [drawerProps, setDrawerProps] = useState<any>(DEFAULT_DRAWER_PROPS);

  const openDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      setIsOpen(true);
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setDrawerComponent(null);
    // The shell class has to outlast the slide-out, or the card drops to the
    // default full-height panel over the page header while it leaves.
    setDrawerProps((prev) => ({
      ...DEFAULT_DRAWER_PROPS,
      shellClass: prev.shellClass,
    }));
  }, []);

  const renderDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      // Never overwrite an active open drawer with a background render call
      // unless that drawer is already displaying this component.
      if (isOpen && drawerComponent !== component) {
        return;
      }
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [isOpen, drawerComponent],
  );

  // Update the global ref
  drawerServiceRef = { openDrawer, closeDrawer, renderDrawer };

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        drawerComponent,
        drawerProps,
        openDrawer,
        closeDrawer,
        renderDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
