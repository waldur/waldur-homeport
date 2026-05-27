import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
} from 'react';

import { DrawerComponent } from '@/metronic/components';

export interface DrawerProps {
  title?: React.ReactNode;
  subtitle?: string;
  footer?: ComponentType<any>;
  toolbar?: ComponentType<{ close: () => void }>;
  width?: string;
  [key: string]: any;
}

interface DrawerContextValue {
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
  const [drawerComponent, setDrawerComponent] =
    useState<ComponentType<any> | null>(null);
  const [drawerProps, setDrawerProps] = useState<any>(DEFAULT_DRAWER_PROPS);

  const openDrawer = useCallback(
    <T,>(component: ComponentType<T>, props?: T & DrawerProps) => {
      const drawer = DrawerComponent.getInstance('kt_drawer');
      drawer?.show();
      setDrawerComponent(() => component);
      setDrawerProps({ ...DEFAULT_DRAWER_PROPS, ...props });
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    const drawer = DrawerComponent.getInstance('kt_drawer');
    drawer?.hide();
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
