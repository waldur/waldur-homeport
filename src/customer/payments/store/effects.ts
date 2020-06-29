import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import { PAYMENTS_TABLE } from '@waldur/customer/details/constants';
import * as api from '@waldur/customer/payments/api';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { fetchListStart } from '@waldur/table/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import * as constants from '../constants';

function* createPayment(action) {
  try {
    yield call(api.createPayment, {
      ...action.payload,
    });
    yield put(showSuccess(translate('Payment has been created.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield put(
      fetchListStart(PAYMENTS_TABLE, {
        profile_uuid: getActivePaymentProfile(customer.payment_profiles).uuid,
      }),
    );
  } catch (error) {
    const errorMessage = `${translate('Unable to create payment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* updatePayment(action) {
  try {
    yield call(api.updatePayment, action.payload);
    yield put(showSuccess(translate('Payment has been updated.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield put(
      fetchListStart(PAYMENTS_TABLE, {
        profile_uuid: getActivePaymentProfile(customer.payment_profiles).uuid,
      }),
    );
  } catch (error) {
    const errorMessage = `${translate('Unable to update payment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* deletePayment(action: Action<any>) {
  try {
    yield call(api.deletePayment, action.payload);
    yield put(showSuccess(translate('Payment has been deleted.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield put(
      fetchListStart(PAYMENTS_TABLE, {
        profile_uuid: getActivePaymentProfile(customer.payment_profiles).uuid,
      }),
    );
  } catch (error) {
    const errorMessage = `${translate('Unable to delete payment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.CREATE_PAYMENT, createPayment);
  yield takeEvery(constants.UPDATE_PAYMENT, updatePayment);
  yield takeEvery(constants.DELETE_PAYMENT, deletePayment);
}
