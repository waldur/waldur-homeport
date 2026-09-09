import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
} from 'react';

export interface DrawerProps {
  title?: React.ReactNode;
  subtitle?: string;
  footer?: ComponentType<any>;
  toolbar?: ComponentType<{ close: () => void }>;
  width?: string;
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
    setDrawerProps(DEFAULT_DRAWER_PROPS);
  }, []);

  const renderDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [],
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
