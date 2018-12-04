import { reset } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getProviderType } from '@waldur/marketplace/common/registry';
import { Category } from '@waldur/marketplace/types';
import { createProvider } from '@waldur/providers/api';
import { findProvider } from '@waldur/providers/registry';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table-react/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { setStep, loadDataSuccess, loadDataError } from './actions';
import * as constants from './constants';
import { STATES } from './constants';
import { OfferingFormData, OfferingUpdateFormData } from './types';
import { formatOfferingRequest } from './utils';

function* loadData() {
  try {
    const categories: Category[] = yield call(api.getCategories);
    const pluginsData = yield call(api.getPlugins);
    const plugins = pluginsData.reduce((result, plugin) => ({...result, [plugin.offering_type]: plugin.components}), {});
    yield put(loadDataSuccess({categories, plugins}));
  } catch {
    yield put(loadDataError());
  }
}

function* createOffering(action: Action<OfferingFormData>) {
  const { thumbnail, service_settings, ...rest } = action.payload;
  const customer = yield select(getCustomer);
  try {
    const offeringType = rest.type.value;
    const providerType = getProviderType(offeringType);
    if (providerType) {
      const providerConfig = findProvider(providerType);
      const providerRequest = {
        customer,
        name: rest.name,
        type: providerConfig,
        details: service_settings,
      };
      const providerResponse = yield call(createProvider, providerRequest);
      // tslint:disable-next-line
      rest['scope'] = providerResponse.data.settings;
    }
    const offeringRequest = formatOfferingRequest(rest, customer);
    const response = yield call(api.createOffering, offeringRequest);
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
  yield put(setStep('Overview'));
  yield put(showSuccess(translate('Offering has been created.')));
  $state.go('marketplace-vendor-offerings');
}

function* updateOffering(action: Action<OfferingUpdateFormData>) {
  const { offeringUuid, thumbnail, ...rest } = action.payload;
  try {
  yield call(api.updateOffering, offeringUuid, rest);
  if (thumbnail instanceof File || thumbnail === '') {
    yield call(api.uploadOfferingThumbnail, offeringUuid, thumbnail);
  }
  } catch (error) {
    const errorMessage = `${translate('Unable to update offering.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.updateOffering.failure());
    return;
  }
  yield put(constants.updateOffering.success());
  yield put(reset(constants.OFFERING_UPDATE_FORM));
  yield put(showSuccess(translate('Offering has been updated.')));
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

function* loadOffering(action) {
  const { offeringUuid } = action.payload;
  try {
    const offering = yield call(api.getOffering, offeringUuid);
    yield put(loadDataSuccess({offering}));
  } catch {
    yield put(loadDataError());
  }
}

export default function*() {
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeEvery(constants.LOAD_OFFERING_START, loadOffering);
  yield takeEvery(constants.createOffering.REQUEST, createOffering);
  yield takeEvery(constants.updateOffering.REQUEST, updateOffering);
  yield takeEvery(constants.UPDATE_OFFERING_STATE, updateOfferingState);
}
