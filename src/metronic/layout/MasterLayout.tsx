import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useEffect } from 'react';

import { PermissionLayout } from '@waldur/auth/PermissionLayout';

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
        <PermissionLayout>
          <UIView />
        </PermissionLayout>
      </Content>
    </PageDataProvider>
  );
};

export { MasterLayout };
