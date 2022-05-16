import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useEffect } from 'react';

import { MenuComponent } from '../assets/ts/components';

import { Content } from './components/Content';
import { PageDataProvider } from './core';

const MasterLayout = () => {
  const { state } = useCurrentStateAndParams();
  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 500);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 500);
  }, [state]);

  return (
    <PageDataProvider>
      <Content>
        <UIView />
      </Content>
    </PageDataProvider>
  );
};

export { MasterLayout };
