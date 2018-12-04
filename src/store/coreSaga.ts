import { takeEvery } from 'redux-saga/effects';

import { $rootScope, ngInjector, $state } from '@waldur/core/services';

export const EMIT_SIGNAL = 'waldur/core/EMIT_SIGNAL';
export const SHOW_NOTIFICATION = 'waldur/core/SHOW_NOTIFICATION';
export const STATE_GO = 'waldur/core/STATE_GO';

export const emitSignal = (signal: string, params?: {}) => ({
  type: EMIT_SIGNAL,
  signal,
  params,
});

export const showSuccess = message => showNotification('success', message);

export const showError = message => showNotification('danger', message);

export const stateGo = (to, params?: object, options?: object) => ({
  type: STATE_GO,
  payload: {
    to,
    params,
    options,
  },
});

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

  yield takeEvery<any>(STATE_GO, action => {
    $state.go(action.payload.to, action.payload.params, action.payload.options);
  });
}
