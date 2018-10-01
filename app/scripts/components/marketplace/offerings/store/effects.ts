import { reset } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table-react/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { setStep, loadDataSuccess, loadDataError } from './actions';
import * as constants from './constants';
import { STATES } from './constants';
import { formatOfferingRequest } from './utils';

function* loadData() {
  try {
    const categories = yield call(api.getCategories);
    const pluginsData = yield call(api.getPlugins);
    const plugins = pluginsData.reduce((result, plugin) => ({...result, [plugin.offering_type]: plugin.components}), {});
    yield put(loadDataSuccess(categories, plugins));
  } catch {
    yield put(loadDataError());
  }
}

function* createOffering(action) {
  const { thumbnail, ...rest } = action.payload;
  const customer = yield select(getCustomer);
  const params = formatOfferingRequest(rest, customer);
  try {
    const response = yield call(api.createOffering, params);
    if (thumbnail) {
      const offeringId = response.data.uuid;
      yield call(api.uploadOfferingThumbnail, offeringId, thumbnail);
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to create offering.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.createOffering.failure());
    return;
  }
  yield put(constants.createOffering.success());
  yield put(reset(constants.FORM_ID));
  yield put(setStep('Describe'));
  yield put(showSuccess(translate('Offering has been created.')));
  $state.go('marketplace-vendor-offerings');
}

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
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeEvery(constants.createOffering.REQUEST, createOffering);
  yield takeEvery(constants.UPDATE_OFFERING_STATE, updateOfferingState);
}
