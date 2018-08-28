import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';

function* setOrderState(action) {
  const { orderUuid, state } = action.payload;
  try {
    yield put(actions.setOrderStateChangeStatus({processing: true}));
    yield call(api.setOrderState, orderUuid, state);
    yield put(showSuccess(translate('Order has been approved.')));
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: true}));
  } catch (error) {
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: false}));
    const errorMessage = `${translate('Unable to approve order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(constants.SET_ORDER_STATE, setOrderState);
}
