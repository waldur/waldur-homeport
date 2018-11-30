import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as constants from './constants';

function* setOrderState(action) {
  const { orderUuid } = action.payload;
  try {
    yield put(actions.setOrderStateChangeStatus({processing: true}));
    yield call(api.approveOrder, orderUuid);
    yield put(showSuccess(translate('Order has been approved.')));
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: true}));
  } catch (error) {
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: false}));
    const errorMessage = `${translate('Unable to approve order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(constants.APPROVE_ORDER, setOrderState);
}
