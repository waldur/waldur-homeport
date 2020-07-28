import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import * as api from '@waldur/customer/payments/api';
import { updatePaymentsList } from '@waldur/customer/payments/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';
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
    yield put(updatePaymentsList(customer));
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
    yield put(updatePaymentsList(customer));
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
    yield put(updatePaymentsList(customer));
  } catch (error) {
    const errorMessage = `${translate('Unable to delete payment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* linkInvoice(action: Action<any>) {
  try {
    yield call(api.linkInvoice, action.payload);
    yield put(
      showSuccess(
        translate('Invoice has been successfully linked to payment.'),
      ),
    );
    const customer = yield select(getCustomer);
    yield put(updatePaymentsList(customer));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to link invoice to the payment.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* unlinkInvoice(action: Action<any>) {
  try {
    yield call(api.unlinkInvoice, action.payload);
    yield put(
      showSuccess(
        translate('Invoice has been successfully unlinked from payment.'),
      ),
    );
    const customer = yield select(getCustomer);
    yield put(updatePaymentsList(customer));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to unlink invoice from the payment.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.CREATE_PAYMENT, createPayment);
  yield takeEvery(constants.UPDATE_PAYMENT, updatePayment);
  yield takeEvery(constants.DELETE_PAYMENT, deletePayment);
  yield takeEvery(constants.LINK_INVOICE, linkInvoice);
  yield takeEvery(constants.UNLINK_INVOICE, unlinkInvoice);
}
