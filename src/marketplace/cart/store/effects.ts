import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { INIT_CONFIG } from '@waldur/store/config';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';
import { USER_LOGGED_IN } from '@waldur/workspace/constants';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import * as actions from './actions';
import * as constants from './constants';

const formatItem = item => ({
  offering: item.offering.url,
  plan: item.plan ? item.plan.url : undefined,
  attributes: item.attributes,
  limits: item.limits,
});

function* initCart() {
  if (!isFeatureVisible('marketplace')) {
    return;
  }
  try {
    const items = yield call(api.getCartItems);
    yield put(actions.setItems(items));
  } catch (error) {
    if (error.status === -1 || error.status === 401) {
      return;
    }
    const errorMessage = `${translate('Unable to initialize shopping cart.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* addItem(action) {
  try {
    const item = yield call(api.addCartItem, formatItem(action.payload.item));
    yield put(actions.addItemSuccess(item));

    const items = yield call(api.getCartItems);
    yield put(actions.setItems(items));

    yield put(showSuccess(translate('Item has been added to shopping cart.')));
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === 'organization') {
      yield put(stateGo('marketplace-checkout-customer'));
    } else {
      yield put(stateGo('marketplace-checkout'));
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to add item to shopping cart.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(actions.addItemError());
  }
}

function* removeItem(action) {
  try {
    yield call(api.removeCartItem, action.payload.uuid);
    yield put(actions.removeItemSuccess(action.payload.uuid));

    const items = yield call(api.getCartItems);
    yield put(actions.setItems(items));

    yield put(showSuccess(translate('Item has been removed from shopping cart.')));
  } catch (error) {
    const errorMessage = `${translate('Unable to remove item from shopping cart.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(actions.removeItemError());
  }
}

function* createOrder() {
  const project = yield select(getProject);
  if (!project) {
    yield put(actions.createOrderError());
    yield put(showError(translate('Project is not selected.')));
    return;
  }
  try {
    const order = yield call(api.submitCart, {project: project.url});
    yield put(showSuccess(translate('Order has been submitted.')));
    yield put(actions.createOrderSuccess());
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === 'organization') {
      yield put(stateGo('marketplace-order-details-customer', {order_uuid: order.uuid}));
    } else {
      yield put(stateGo('marketplace-order-details', {order_uuid: order.uuid}));
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to submit order.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(actions.createOrderError());
  }
}

export default function*() {
  yield takeEvery([INIT_CONFIG, USER_LOGGED_IN], initCart);
  yield takeEvery(constants.ADD_ITEM_REQUEST, addItem);
  yield takeEvery(constants.REMOVE_ITEM_REQUEST, removeItem);
  yield takeEvery(constants.CREATE_ORDER_REQUEST, createOrder);
}
