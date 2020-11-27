import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as api from '@waldur/booking/common/api';
import { updateBookingsList } from '@waldur/booking/utils';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { selectTableSorting } from '@waldur/workspace/selectors';

import * as constants from '../constants';
import { BOOKING_RESOURCES_TABLE } from '../constants';

import { setBookingItems } from './actions';

function* fetchBookings(action) {
  try {
    const response = yield call(api.getBookingsList, action.payload);
    yield put(setBookingItems(action.payload.offering_uuid, response));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to fetch offering bookings.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* acceptBookingItem(action) {
  try {
    yield call(api.acceptBooking, action.payload.uuid);
    const response = yield call(api.getBookingsList, action.payload);
    yield put(setBookingItems(action.payload.offering_uuid, response));
    yield put(showSuccess(translate('Booking has been accepted.')));
    const bookingsListSorting = yield select((state) =>
      selectTableSorting(state, BOOKING_RESOURCES_TABLE),
    );
    yield put(
      updateBookingsList(
        action.payload.filterState,
        action.payload.offeringUuid,
        action.payload.providerUuid,
        bookingsListSorting,
      ),
    );
  } catch (error) {
    const errorMessage = `${translate('Unable to accept booking.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* rejectBookingItem(action) {
  try {
    yield call(api.rejectBooking, action.payload.uuid);
    const response = yield call(api.getBookingsList, action.payload);
    yield put(setBookingItems(action.payload.offering_uuid, response));
    yield put(showSuccess(translate('Booking has been rejected.')));
    const bookingsListSorting = yield select((state) =>
      selectTableSorting(state, BOOKING_RESOURCES_TABLE),
    );
    yield put(
      updateBookingsList(
        action.payload.filterState,
        action.payload.offeringUuid,
        action.payload.providerUuid,
        bookingsListSorting,
      ),
    );
  } catch (error) {
    const errorMessage = `${translate('Unable to reject booking.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.BOOKINGS_FETCH, fetchBookings);
  yield takeEvery(constants.BOOKING_ACCEPT, acceptBookingItem);
  yield takeEvery(constants.BOOKING_REJECT, rejectBookingItem);
}
