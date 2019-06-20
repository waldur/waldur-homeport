import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as constants from './constants';

function* approveOrder(action) {
  const { orderUuid } = action.payload;
  try {
    yield put(actions.setOrderStateChangeStatus({approving: true}));
    yield call(api.approveOrder, orderUuid);
    yield put(showSuccess(translate('Order has been approved.')));
  } catch (error) {
    const errorMessage = `${translate('Unable to approve order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
  yield put(actions.setOrderStateChangeStatus({approving: false}));
}

function* fetchPendingOrders(action) {
  const { params } = action.payload;
  try {
    const orders = yield call(api.getOrdersList, params);
    yield put(actions.fetchPendingOrdersSuccess(orders));
  } catch (error) {
    const errorMessage = `${translate('Unable to load pending orders.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* rejectOrder(action) {
  const { orderUuid } = action.payload;
  try {
    yield put(actions.setOrderStateChangeStatus({rejecting: true}));
    yield call(api.rejectOrder, orderUuid);
    yield put(showSuccess(translate('Order has been rejected.')));
  } catch (error) {
    const errorMessage = `${translate('Unable to reject order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
  yield put(actions.setOrderStateChangeStatus({rejecting: false}));
}

export default function*() {
  yield takeEvery(constants.APPROVE_ORDER, approveOrder);
  yield takeEvery(constants.REJECT_ORDER, rejectOrder);
  yield takeEvery(constants.PENDING_ORDERS_FETCH, fetchPendingOrders);
}
