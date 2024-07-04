import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import * as api from '@waldur/customer/list/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import * as constants from '../constants';

function* organizationLocation(action) {
  try {
    const response = yield call(api.updateOrganization, action.payload);
    yield put(showSuccess(translate('Location has been saved successfully.')));
    yield put(closeModalDialog());
    yield put(fetchListStart(constants.SUPPORT_CUSTOMER_LIST));
    const currentCustomer = yield select(getCustomer);
    if (response.data.uuid === currentCustomer?.uuid) {
      yield put(setCurrentCustomer(response.data));
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to save location.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.SET_ORGANIZATION_LOCATION, organizationLocation);
}
