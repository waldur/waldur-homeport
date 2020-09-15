import { AxiosResponse } from 'axios';
import { notify } from 'reapop';
import { takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $rootScope, $state } from '@waldur/core/services';

export const EMIT_SIGNAL = 'waldur/core/EMIT_SIGNAL';
export const STATE_GO = 'waldur/core/STATE_GO';

export const emitSignal = (signal: string, params?: {}) => ({
  type: EMIT_SIGNAL,
  signal,
  params,
});

export const showSuccess = (message) => notify({ status: 'success', message });

export const showError = (message) => notify({ status: 'error', message });

export const showErrorResponse = (
  response: AxiosResponse,
  message?: string,
) => {
  const details = format(response);
  const errorMessage = `${message}. ${details}`;
  return showError(errorMessage);
};

export const stateGo = (to, params?: object, options?: object) => ({
  type: STATE_GO,
  payload: {
    to,
    params,
    options,
  },
});

export default function* watchEmit() {
  yield takeEvery<any>(EMIT_SIGNAL, (action) =>
    $rootScope.$broadcast(action.signal, action.params),
  );

  yield takeEvery<any>(STATE_GO, (action) => {
    $state.go(action.payload.to, action.payload.params, action.payload.options);
  });
}
