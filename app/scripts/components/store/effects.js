import { fork } from 'redux-saga/effects';

import chartSaga from '@waldur/dashboard/chart/effects';
import modalSaga from '@waldur/modal/effects';
import tableSaga from '@waldur/table-react/effects';

function* rootSaga() {
  yield fork(chartSaga);
  yield fork(modalSaga);
  yield fork(tableSaga);
}

export default rootSaga;
