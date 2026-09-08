import { useEffect, useRef } from 'react';

import { DrawerComponent, ScrollComponent } from '../components';

import { useLayout } from './core/LayoutProvider';

export function MasterInit() {
  const { config } = useLayout();
  const isFirstRun = useRef(true);
  const pluginsInitialization = () => {
    isFirstRun.current = false;
    setTimeout(() => {
      DrawerComponent.bootstrap();
      ScrollComponent.bootstrap();
    }, 500);
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      pluginsInitialization();
    }
  }, [config]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
