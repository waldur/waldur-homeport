import { ErrorBoundary } from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIView } from '@uirouter/react';
import { AxiosError } from 'axios';
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
import { router } from './router';
import { ThemeSelector } from './ThemeSelector';
import { UIRouter } from './UIRouter';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        if ((error as AxiosError)?.response?.status == 404) {
          router.stateService.go('errorPage.notFound');
        }
      },
    },
  },
});

export const Application: FunctionComponent = () => {
  const { loading, error, value } = useAsync(loadConfig);
  if (!value) {
    return <LoadingScreen loading={loading} error={error} />;
  }

  return (
    <ErrorBoundary fallback={ErrorMessage}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <LayoutProvider>
            <ThemeSelector />
            <NotificationContainer />
            <UIRouter>
              <ModalRoot />
              <DrawerRoot />
              <UIView />
            </UIRouter>
            <MasterInit />
          </LayoutProvider>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
