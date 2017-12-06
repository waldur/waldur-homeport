import { fork } from 'redux-saga/effects';

import modalSaga from '@waldur/modal/effects';
import chartSaga from '@waldur/dashboard/chart/effects';
import tableSaga from '@waldur/table-react/effects';
import dashboardFeedSaga from '@waldur/dashboard/effects';

function* rootSaga() {
  yield fork(dashboardFeedSaga);
  yield fork(chartSaga);
  yield fork(tableSaga);
  yield fork(modalSaga);
}

export default rootSaga;
