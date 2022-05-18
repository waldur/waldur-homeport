import { ErrorBoundary } from '@sentry/react';
import { UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { useAsync } from 'react-use';

import { ModalRoot } from '@waldur/modal/ModalRoot';
import store from '@waldur/store/store';

import { loadConfig } from './core/bootstrap';
import { ErrorMessage } from './ErrorMessage';
import { LoadingScreen } from './LoadingScreen';
import { MasterInit } from './metronic/layout/MasterInit';
import { NotificationContainer } from './NotificationContainer';
import { ThemeSelector } from './ThemeSelector';
import { UIRouter } from './UIRouter';

export const Application: FunctionComponent = () => {
  const { loading, error, value } = useAsync(loadConfig);
  if (!value) {
    return <LoadingScreen loading={loading} error={error} />;
  }

  return (
    <Provider store={store}>
      <ThemeSelector />
      <NotificationContainer />
      <UIRouter>
        <ErrorBoundary fallback={ErrorMessage}>
          <ModalRoot />
          <UIView />
        </ErrorBoundary>
      </UIRouter>
      <MasterInit />
    </Provider>
  );
};
