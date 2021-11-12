import { triggerTransition } from '@uirouter/redux';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as api from '@waldur/marketplace/common/api';
import { WORKSPACE_OFFERING_DETAILS } from '@waldur/marketplace/constants';
import { Category } from '@waldur/marketplace/types';
import {
  getWorkspace,
  getCustomer,
  getProject,
} from '@waldur/workspace/selectors';
import { WorkspaceType, USER_WORKSPACE } from '@waldur/workspace/types';

import * as actions from './actions';
import * as constants from './constants';

function* getCategories() {
  const customer = yield select(getCustomer);
  const project = yield select(getProject);
  const options = {
    params: {
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
      has_offerings: true,
    },
  };
  try {
    const categories: Category[] = yield call(api.getCategories, options);
    yield put(actions.categoriesFetchSuccess(categories));
  } catch {
    yield put(actions.categoriesFetchError());
  }
}

function* getOfferings() {
  const customer = yield select(getCustomer);
  const project = yield select(getProject);
  const workspace: WorkspaceType = yield select(getWorkspace);
  const field = [
    'uuid',
    'name',
    'description',
    'thumbnail',
    'rating',
    'order_item_count',
    'category_uuid',
    'attributes',
    'customer_name',
    'customer_uuid',
    'state',
    'paused_reason',
  ];
  const params: Record<string, any> = {
    page_size: 6,
    o: '-created',
    state: ['Active', 'Paused'],
    field,
    allowed_customer_uuid: customer?.uuid,
    project_uuid: project?.uuid,
  };
  if (workspace === USER_WORKSPACE) {
    params.shared = true;
  }
  try {
    const offerings = yield call(api.getOfferingsList, params);
    yield put(actions.offeringsFetchSuccess(offerings));
  } catch {
    yield put(actions.offeringsFetchError());
  }
}

function* gotoOffering(action) {
  const offeringId = action.payload.offeringId;
  const params = { offering_uuid: offeringId };
  const workspace: WorkspaceType = yield select(getWorkspace);
  const state = WORKSPACE_OFFERING_DETAILS[workspace];
  yield put(triggerTransition(state, params));
}

export default function* () {
  yield takeEvery(constants.CATEGORIES_FETCH_START, getCategories);
  yield takeEvery(constants.OFFERINGS_FETCH_START, getOfferings);
  yield takeEvery(constants.GOTO_OFFERING, gotoOffering);
}
