import { useEffect, useRef } from 'react';

import {
  DrawerComponent,
  ScrollComponent,
  ToggleComponent,
  SwapperComponent,
} from '../components';

import { useLayout } from './core/LayoutProvider';

export function MasterInit() {
  const { config } = useLayout();
  const isFirstRun = useRef(true);
  const pluginsInitialization = () => {
    isFirstRun.current = false;
    setTimeout(() => {
      ToggleComponent.bootstrap();
      DrawerComponent.bootstrap();
      ScrollComponent.bootstrap();
      SwapperComponent.bootstrap();
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
