import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import { PAYMENT_PROFILES_TABLE } from '@waldur/customer/details/constants';
import * as api from '@waldur/customer/payment-profiles/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';
import { FETCH_LIST_START } from '@waldur/table-react/actions';
import { fetchList } from '@waldur/table-react/effects';
import { getCustomer } from '@waldur/workspace/selectors';

import * as constants from '../constants';

function* addPaymentProfile(action) {
  try {
    const customer = yield select(getCustomer);
    yield call(api.createPaymentProfile, {
      ...action.payload,
      customer,
    });
    yield put(showSuccess(translate('Payment profile has been created.')));
    yield put(stateGo('organization.manage'));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to create payment profile.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* editPaymentProfile(action) {
  try {
    yield call(api.updatePaymentProfile, action.payload);
    yield put(showSuccess(translate('Payment profile has been updated.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield fetchList({
      type: FETCH_LIST_START,
      payload: {
        table: PAYMENT_PROFILES_TABLE,
        extraFilter: {
          organization_uuid: customer.uuid,
        },
      },
    });
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to update payment profile.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* removePaymentProfile(action: Action<any>) {
  try {
    yield call(api.deletePaymentProfile, action.payload);
    yield put(showSuccess(translate('Payment profile has been removed.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield fetchList({
      type: FETCH_LIST_START,
      payload: {
        table: PAYMENT_PROFILES_TABLE,
        extraFilter: {
          organization_uuid: customer.uuid,
        },
      },
    });
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to remove payment profile.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* enablePaymentProfile(action: Action<any>) {
  try {
    yield call(api.enablePaymentProfile, action.payload);
    yield put(showSuccess(translate('Payment profile has been enabled.')));
    const customer = yield select(getCustomer);
    yield fetchList({
      type: FETCH_LIST_START,
      payload: {
        table: PAYMENT_PROFILES_TABLE,
        extraFilter: {
          organization_uuid: customer.uuid,
        },
      },
    });
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to enable payment profile.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(constants.ADD_PAYMENT_PROFILE, addPaymentProfile);
  yield takeEvery(constants.EDIT_PAYMENT_PROFILE, editPaymentProfile);
  yield takeEvery(constants.REMOVE_PAYMENT_PROFILE, removePaymentProfile);
  yield takeEvery(constants.ENABLE_PAYMENT_PROFILE, enablePaymentProfile);
}
