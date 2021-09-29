import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
// import { updatePaymentsList } from '@waldur/customer/payments/utils';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/offerings/service-providers/api';
import { updateServiceProviderDescription } from '@waldur/marketplace/offerings/service-providers/store/actions';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
// import { getCustomer } from '@waldur/workspace/selectors';

function* updateDescription(action) {
  try {
    yield call(api.updateDescription, action.payload);
    yield put(showSuccess(translate('Description has been updated.')));
    yield put(closeModalDialog());
    // todo re-fetch service provider. Data should be updated
    // todo should I store service provider in the global store like we do for customer?
    // const customer = yield select(getCustomer);
    // yield put(updatePaymentsList(customer));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to update description.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(updateServiceProviderDescription.REQUEST, updateDescription);
}
