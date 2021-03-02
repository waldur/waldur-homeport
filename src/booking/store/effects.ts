import { call, put, takeEvery } from 'redux-saga/effects';

import * as api from '@waldur/booking/api';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import * as constants from '../constants';

function* acceptBookingItem(action) {
  try {
    yield call(api.acceptBooking, action.payload.row.uuid);
    yield call(action.payload.onRefresh);
    yield put(showSuccess(translate('Booking has been accepted.')));
  } catch (error) {
    yield put(showErrorResponse(error, translate('Unable to accept booking.')));
  }
}

function* rejectBookingItem(action) {
  try {
    yield call(api.rejectBooking, action.payload.row.uuid);
    yield call(action.payload.onRefresh);
    yield put(showSuccess(translate('Booking has been rejected.')));
  } catch (error) {
    yield put(showErrorResponse(error, translate('Unable to reject booking.')));
  }
}

export default function* () {
  yield takeEvery(constants.BOOKING_ACCEPT, acceptBookingItem);
  yield takeEvery(constants.BOOKING_REJECT, rejectBookingItem);
}
