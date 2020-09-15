import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-bootstrap';

import store from '@waldur/store/store';

export const renderNotificationsContainer = () => {
  ReactDOM.render(
    <Provider store={store}>
      <NotificationsSystem theme={theme} />
    </Provider>,
    document.getElementById('notifications-root'),
  );
};
