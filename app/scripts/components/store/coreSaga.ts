import { takeEvery } from 'redux-saga/effects';

import { $rootScope } from '@waldur/core/services';

export const EMIT_SIGNAL = 'waldur/core/EMIT_SIGNAL';

export const emitSignal = (signal: string) => ({
  type: EMIT_SIGNAL,
  signal,
});

export default function* watchEmit() {
  yield takeEvery<any>(EMIT_SIGNAL, action => $rootScope.$broadcast(action.signal));
}
