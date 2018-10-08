import { takeEvery } from 'redux-saga/effects';

import { $rootScope, ngInjector } from '@waldur/core/services';

export const EMIT_SIGNAL = 'waldur/core/EMIT_SIGNAL';
export const SHOW_NOTIFICATION = 'waldur/core/SHOW_NOTIFICATION';

export const emitSignal = (signal: string, params?: {}) => ({
  type: EMIT_SIGNAL,
  signal,
  params,
});

export const showSuccess = message => showNotification('success', message);
export const showError = message => showNotification('danger', message);

const showNotification = (type, message) => ({
  type: SHOW_NOTIFICATION,
  payload: {
    type,
    message,
  },
});

export default function* watchEmit() {
  yield takeEvery<any>(EMIT_SIGNAL, action => $rootScope.$broadcast(action.signal, action.params));

  yield takeEvery<any>(SHOW_NOTIFICATION, ({ payload: {type, message} }) =>
    ngInjector.get('Flash').create(type, message));
}
