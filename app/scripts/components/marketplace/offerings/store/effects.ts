import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table-react/actions';

import * as constants from './constants';
import { STATES } from './constants';

function* updateOfferingState(action) {
  const { offering, stateAction } = action.payload;
  try {
    const response = yield call(api.updateOfferingState, offering.uuid, stateAction);
    const state = STATES[response.state];
    yield put(updateEntity(constants.TABLE_NAME, offering.uuid, {...offering, state}));
    yield put(showSuccess(translate('Offering state has been updated.')));
  } catch (error) {
    const errorMessage = `${translate('Unable to update offering state.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(constants.UPDATE_OFFERING_STATE, updateOfferingState);
}
