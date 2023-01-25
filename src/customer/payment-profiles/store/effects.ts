import { call, put, select, takeEvery } from 'redux-saga/effects';

import { Action } from '@waldur/core/reducerActions';
import * as api from '@waldur/customer/payment-profiles/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getCustomer as getCustomerApi } from '@waldur/project/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import * as constants from '../constants';

function* addPaymentProfile(action) {
  try {
    const customer = yield select(getCustomer);
    const paymentProfile = yield call(api.createPaymentProfile, {
      ...action.payload.formData,
      customer,
    });
    if (paymentProfile?.uuid && action.payload.formData.enabled) {
      yield call(api.enablePaymentProfile, paymentProfile.uuid);
    }
    const successMessageForCreation = translate(
      'Payment profile has been created.',
    );
    const successMessageForCreationAndEnabling = translate(
      'Payment profile has been created and enabled.',
    );
    yield put(
      showSuccess(
        action.payload.formData.enabled
          ? successMessageForCreationAndEnabling
          : successMessageForCreation,
      ),
    );
    const updatedCustomer = yield call(getCustomerApi, customer.uuid);
    yield put(setCurrentCustomer(updatedCustomer));
    yield call(action.payload.refetch);
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to create payment profile.')),
    );
  }
}

function* editPaymentProfile(action) {
  try {
    yield call(
      api.updatePaymentProfile,
      action.payload.uuid,
      action.payload.formData,
    );
    yield put(showSuccess(translate('Payment profile has been updated.')));
    yield put(closeModalDialog());
    yield call(action.payload.refetch);
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to update payment profile.')),
    );
  }
}

function* removePaymentProfile(action: Action<any>) {
  try {
    yield call(api.deletePaymentProfile, action.payload.uuid);
    yield put(showSuccess(translate('Payment profile has been removed.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield call(action.payload.refetch);
    const updatedCustomer = yield call(getCustomerApi, customer.uuid);
    yield put(setCurrentCustomer(updatedCustomer));
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to remove payment profile.')),
    );
  }
}

function* enablePaymentProfile(action: Action<any>) {
  try {
    yield call(api.enablePaymentProfile, action.payload.uuid);
    yield put(showSuccess(translate('Payment profile has been enabled.')));
    const customer = yield select(getCustomer);
    yield call(action.payload.refetch);
    const updatedCustomer = yield call(getCustomerApi, customer.uuid);
    yield put(setCurrentCustomer(updatedCustomer));
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to enable payment profile.')),
    );
  }
}

export default function* () {
  yield takeEvery(constants.ADD_PAYMENT_PROFILE, addPaymentProfile);
  yield takeEvery(constants.EDIT_PAYMENT_PROFILE, editPaymentProfile);
  yield takeEvery(constants.REMOVE_PAYMENT_PROFILE, removePaymentProfile);
  yield takeEvery(constants.ENABLE_PAYMENT_PROFILE, enablePaymentProfile);
}
