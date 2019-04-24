import { reset, change } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table-react/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { setStep, loadDataSuccess, loadDataError } from './actions';
import * as constants from './constants';
import { STATES } from './constants';
import { getPlans, getAttributes, getOffering } from './selectors';
import { OfferingFormData, OfferingUpdateFormData } from './types';
import { formatOfferingRequest, planWithoutComponent, planWithoutQuotas } from './utils';

function* loadCategories() {
  const categories: Category[] = yield call(api.getCategories);
  const pluginsData = yield call(api.getPlugins);
  const plugins = pluginsData.reduce((result, plugin) => ({...result, [plugin.offering_type]: plugin.components}), {});
  return {categories, plugins};
}

function* loadData() {
  try {
    const data = yield loadCategories();
    yield put(loadDataSuccess({...data, offering: undefined}));
  } catch {
    yield put(loadDataError());
  }
}

function* removeOfferingComponent(action) {
  const plans = yield select(getPlans);
  const newPlans = plans.map(plan => planWithoutComponent(plan, action.payload.component));
  yield put(change(constants.FORM_ID, 'plans', newPlans));
}

function* removeOfferingQuotas(action) {
  const plans = yield select(getPlans);
  const newPlans = plans.map(plan => planWithoutQuotas(plan, action.payload.component));
  yield put(change(constants.FORM_ID, 'plans', newPlans));
}

function* handleCategoryChange(action) {
  const category: Category = action.payload.category;
  const values = yield select(getAttributes);
  const attributes = values === undefined ? {} : {...values};
  for (const section of category.sections) {
    for (const attribute of section.attributes) {
      if (attributes[attribute.key] === undefined && attribute.default !== null) {
        attributes[attribute.key] = attribute.default;
      }
    }
  }
  yield put(change(constants.FORM_ID, 'attributes', attributes));
}

function* createOffering(action: Action<OfferingFormData>) {
  const { thumbnail, document, ...rest } = action.payload;
  const customer = yield select(getCustomer);
  try {
    const offeringRequest = formatOfferingRequest(rest, customer);
    const response = yield call(api.createOffering, offeringRequest);
    if (thumbnail) {
      const offeringId = response.data.uuid;
      yield call(api.uploadOfferingThumbnail, offeringId, thumbnail);
    }
    if (document && document.file) {
      yield call(api.uploadOfferingDocument, response.data.url, document);
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
  yield put(stateGo('marketplace-vendor-offerings'));
}

function* updateOffering(action: Action<OfferingUpdateFormData>) {
  const { offeringUuid, thumbnail, ...rest } = action.payload;
  const offering = yield select(getOffering);
  const components = offering.plugins[rest.type.value];
  const hasBuiltinComponents = components.length > 0;
  try {
    const offeringRequest = formatOfferingRequest(rest, undefined, hasBuiltinComponents);
    yield call(api.updateOffering, offeringUuid, offeringRequest);
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
  yield put(reset(constants.FORM_ID));
  yield put(showSuccess(translate('Offering has been updated.')));
  yield put(stateGo('marketplace-vendor-offerings'));
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
    const data = yield loadCategories();
    const offering = yield call(api.getOffering, offeringUuid);
    yield put(loadDataSuccess({offering, ...data}));
  } catch {
    yield put(loadDataError());
  }
}

export default function*() {
  yield takeEvery(constants.REMOVE_OFFERING_COMPONENT, removeOfferingComponent);
  yield takeEvery(constants.REMOVE_OFFERING_QUOTAS, removeOfferingQuotas);
  yield takeEvery(constants.CATEGORY_CHANGED, handleCategoryChange);
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeEvery(constants.LOAD_OFFERING_START, loadOffering);
  yield takeEvery(constants.createOffering.REQUEST, createOffering);
  yield takeEvery(constants.updateOffering.REQUEST, updateOffering);
  yield takeEvery(constants.UPDATE_OFFERING_STATE, updateOfferingState);
}
