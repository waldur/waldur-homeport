import { ErrorBoundary } from '@sentry/react';
import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { UIRouter, UIView } from '@uirouter/react';
import { FunctionComponent, Suspense } from 'react';
import { Provider } from 'react-redux';
import { NotificationsProvider, setUpNotifications } from 'reapop';

import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { queryClient } from '@/core/queryClient';
import { DrawerProvider } from '@/drawer/DrawerContext';
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

setUpNotifications({
  defaultProps: {
    position: 'top-right',
    dismissible: true,
    dismissAfter: 7000,
    showDismissButton: true,
  },
});

const ApplicationInner: FunctionComponent = () => {
  useSuspenseQuery({
    queryKey: ['Application'],
    queryFn: loadConfig,
  });

  return (
    <ErrorBoundary fallback={ErrorMessage}>
      <NotificationsProvider>
        <UIRouter router={router}>
          <Provider store={store}>
            <LayoutProvider>
              <ThemeProvider>
                <ThreadProvider>
                  <NotificationContainer />
                  <ModalProvider>
                    <DrawerProvider>
                      <ModalRoot />
                      <ConfirmModalRoot />
                      <DrawerRoot />
                      <UIView />
                    </DrawerProvider>
                  </ModalProvider>
                  <MasterInit />
                </ThreadProvider>
              </ThemeProvider>
            </LayoutProvider>
          </Provider>
        </UIRouter>
      </NotificationsProvider>
    </ErrorBoundary>
  );
};

export const Application: FunctionComponent = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary
      fallback={({ error }) => (
        <LoadingScreen loading={false} error={error as Error} />
      )}
    >
      <Suspense fallback={<LoadingScreen loading={true} />}>
        <ApplicationInner />
      </Suspense>
    </ErrorBoundary>
  </QueryClientProvider>
);
