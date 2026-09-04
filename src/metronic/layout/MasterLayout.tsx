import { UIView } from '@uirouter/react';

import { PermissionLayout } from '@/auth/PermissionLayout';

import { Content } from './components/Content';
import { PageDataProvider } from './core';

const MasterLayout = () => {
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
