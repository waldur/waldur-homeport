import { ErrorBoundary } from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { UIRouter, UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { useAsync } from 'react-use';

import { ThreadProvider } from '@waldur/ai-assistant/logic/ThreadProvider';
import { queryClient } from '@waldur/core/queryClient';
import { DrawerRoot } from '@waldur/drawer/DrawerRoot';
import { ModalRoot } from '@waldur/modal/ModalRoot';
import store from '@waldur/store/store';

import { loadConfig } from './core/bootstrap';
import { ErrorMessage } from './ErrorMessage';
import { LoadingScreen } from './LoadingScreen';
import { LayoutProvider } from './metronic/layout/core';
import { MasterInit } from './metronic/layout/MasterInit';
import { ConfirmModalRoot } from './modal/ConfirmModalRoot';
import { NotificationContainer } from './NotificationContainer';
import { router } from './router';
import { states } from './states';
import { ThemeProvider } from './theme/ThemeProvider';

states.forEach((state) => router.stateRegistry.register(state));

export const Application: FunctionComponent = () => {
  const { loading, error, value } = useAsync(loadConfig);
  if (!value) {
    return <LoadingScreen loading={loading} error={error} />;
  }

  return (
    <ErrorBoundary fallback={ErrorMessage}>
      <UIRouter router={router}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <LayoutProvider>
              <ThemeProvider>
                <ThreadProvider>
                  <NotificationContainer />
                  <ModalRoot />
                  <ConfirmModalRoot />
                  <DrawerRoot />
                  <UIView />
                  <MasterInit />
                </ThreadProvider>
              </ThemeProvider>
            </LayoutProvider>
          </Provider>
        </QueryClientProvider>
      </UIRouter>
    </ErrorBoundary>
  );
};
