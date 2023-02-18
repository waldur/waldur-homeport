import { ErrorBoundary } from '@sentry/react';
import { UIView } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { formatMediaURL } from '@waldur/core/utils';
import { ModalRoot } from '@waldur/modal/ModalRoot';
import store from '@waldur/store/store';

import { loadConfig } from './core/bootstrap';
import { ErrorMessage } from './ErrorMessage';
import { LoadingScreen } from './LoadingScreen';
import { NotificationContainer } from './NotificationContainer';
import { UIRouter } from './UIRouter';

export const Application: FunctionComponent = () => {
  const { loading, error, value } = useAsync(loadConfig);
  if (!value) {
    return <LoadingScreen loading={loading} error={error} />;
  } else {
    const link = document.querySelector('link[rel="shortcut icon"]');
    link.setAttribute('href', formatMediaURL(ENV.plugins.WALDUR_CORE.FAVICON));
  }

  return (
    <Provider store={store}>
      <NotificationContainer />
      <UIRouter>
        <ErrorBoundary fallback={ErrorMessage}>
          <ModalRoot />
          <UIView />
        </ErrorBoundary>
      </UIRouter>
    </Provider>
  );
};
