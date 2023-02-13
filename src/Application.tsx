import { ErrorBoundary } from '@sentry/react';
import { UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { formatMediaURL } from '@waldur/core/utils';
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
  } else {
    const link = document.querySelector('link[rel="shortcut icon"]');
    link.setAttribute('href', formatMediaURL(ENV.plugins.WALDUR_CORE.FAVICON));
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
    </QueryClientProvider>
  );
};
