import { ErrorBoundary } from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { useAsync } from 'react-use';

import { DrawerRoot } from '@waldur/drawer/DrawerRoot';
import { ModalRoot } from '@waldur/modal/ModalRoot';
import store from '@waldur/store/store';

import { loadConfig } from './core/bootstrap';
import { ErrorMessage } from './ErrorMessage';
import { LoadingScreen } from './LoadingScreen';
import { LayoutProvider } from './metronic/layout/core';
import { MasterInit } from './metronic/layout/MasterInit';
import { NotificationContainer } from './NotificationContainer';
import { ThemeSelector } from './ThemeSelector';
import { UIRouter } from './UIRouter';

export const queryClient = new QueryClient();

export const Application: FunctionComponent = () => {
  const { loading, error, value } = useAsync(loadConfig);
  if (!value) {
    return <LoadingScreen loading={loading} error={error} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <LayoutProvider>
          <ThemeSelector />
          <NotificationContainer />
          <UIRouter>
            <ErrorBoundary fallback={ErrorMessage}>
              <ModalRoot />
              <DrawerRoot />
              <UIView />
            </ErrorBoundary>
          </UIRouter>
          <MasterInit />
        </LayoutProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
