import { ErrorBoundary } from '@sentry/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { UIRouter, UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { queryClient } from '@/core/queryClient';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { ModalProvider } from '@/modal/ModalContext';
import { ModalRoot } from '@/modal/ModalRoot';
import store from '@/store/store';

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
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['Application'],
    queryFn: loadConfig,
  });
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
                  <ModalProvider>
                    <ModalRoot />
                    <ConfirmModalRoot />
                    <DrawerRoot />
                    <UIView />
                  </ModalProvider>
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
