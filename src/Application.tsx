import { ErrorBoundary } from '@sentry/react';
import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { UIRouter, UIView } from '@uirouter/react';
import { FunctionComponent, PropsWithChildren, Suspense } from 'react';
import { Provider } from 'react-redux';
import { NotificationsProvider, setUpNotifications } from 'reapop';

import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { ThreadRuntimeProvider } from '@/ai-assistant/logic/ThreadRuntimeProvider';
import { queryClient } from '@/core/queryClient';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { MatrixCallHost } from '@/matrix/chat/call/MatrixCallHost';
import { MatrixCallPortalProvider } from '@/matrix/chat/call/MatrixCallPortalProvider';
import { MatrixCallProvider } from '@/matrix/chat/call/MatrixCallProvider';
import { MatrixAutoConnect } from '@/matrix/chat/MatrixAutoConnect';
import { MatrixChatProvider } from '@/matrix/chat/MatrixChatProvider';
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

// Gate the Matrix provider chain on the feature flag so tenants without
// `show_matrix_chat` don't pay for the chat client, the auto-connect query,
// the call provider, or MatrixCallHost's room subscription. All three Matrix
// contexts expose safe no-op defaults, so consumers (e.g. the header chat
// toggle's `useMatrixTotalUnread`) degrade to `0` when the providers aren't
// mounted.
const MatrixRoot: FunctionComponent<PropsWithChildren> = ({ children }) => {
  if (!isFeatureVisible(ProjectFeatures.show_matrix_chat)) {
    return <>{children}</>;
  }
  return (
    <MatrixChatProvider>
      <MatrixAutoConnect />
      <MatrixCallProvider>
        <MatrixCallPortalProvider>
          <MatrixCallHost />
          {children}
        </MatrixCallPortalProvider>
      </MatrixCallProvider>
    </MatrixChatProvider>
  );
};

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
                {/* Drawer/Modal providers must wrap MatrixRoot: MatrixCallHost
                    (rendered inside MatrixRoot) opens the chat drawer from the
                    call widget via useDrawer, so it needs the same shared
                    DrawerProvider instance as the rest of the app. */}
                <ModalProvider>
                  <DrawerProvider>
                    <MatrixRoot>
                      <ThreadProvider>
                        <ThreadRuntimeProvider>
                          <NotificationContainer />
                          <ModalRoot />
                          <ConfirmModalRoot />
                          <DrawerRoot />
                          <UIView />
                          <MasterInit />
                        </ThreadRuntimeProvider>
                      </ThreadProvider>
                    </MatrixRoot>
                  </DrawerProvider>
                </ModalProvider>
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
