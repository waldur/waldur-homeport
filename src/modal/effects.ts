import { takeEvery } from 'redux-saga/effects';

import * as actions from './actions';
import { $uibModal, $uibModalStack } from './services';

function openModalDialog(action) {
  const { component, params } = action.payload;
  const resolve = {};
  if (params && params.resolve) {
    Object.keys(params.resolve).forEach(key => {
      resolve[key] = () => params.resolve[key];
    });
  }
  $uibModal
    .open({ component, resolve, size: params && params.size })
    .result.catch(function error(error) {
      if (error === 'backdrop click') {
        // do nothing
      } else {
        throw error;
      }
    });
}

function closeModalDialog() {
  $uibModalStack.dismissAll();
}

export default function* watchCore() {
  yield takeEvery(actions.OPEN, openModalDialog);
  yield takeEvery(actions.CLOSE, closeModalDialog);
}
