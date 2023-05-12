import { takeEvery, put, call, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/project/api';
import { showError } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

import { REFRESH_CURRENT_CUSTOMER } from './constants';

export function* refreshCurrentCustomer() {
  try {
    const customer = yield select(getCustomerSelector);
    const newCustomer = yield call(getCustomer, customer.uuid);
    yield put(setCurrentCustomer(newCustomer));
  } catch (error) {
    const errorMessage = `${translate(
      'Organization could not be refreshed.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* workspaceSaga() {
  yield takeEvery(REFRESH_CURRENT_CUSTOMER, refreshCurrentCustomer);
}
