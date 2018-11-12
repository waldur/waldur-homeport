import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { INIT_CONFIG } from '@waldur/store/config';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import * as selectors from './selectors';

function* createOrder() {
  const project = yield select(getProject);
  const items = yield select(selectors.getItems);
  try {
    const response = yield call(api.createOrder, {
      project: project.url,
      items: items.map(item => ({
        offering: item.offering.url,
        plan: item.plan ? item.plan.url : undefined,
        attributes: item.attributes,
        limits: item.limits,
      })),
    });
    yield put(showSuccess(translate('Order has been submitted.')));
    yield put(actions.clearCart());
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === 'organization') {
      yield $state.go('marketplace-order-details-customer', {order_uuid: response.data.uuid});
    } else {
      yield $state.go('marketplace-order-details', {order_uuid: response.data.uuid});
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to create order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* syncCart() {
  const cart = yield select(selectors.getCart);
  localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(cart));
}

function* clearCart() {
  localStorage.removeItem(constants.STORAGE_KEY);
}

function* restoreCart() {
  let cart = localStorage.getItem(constants.STORAGE_KEY);
  if (cart) {
    try {
      cart = JSON.parse(cart);
      yield put(actions.setCart(cart));
    } catch (error) {
      yield put(showError(translate('Unable to restore shopping cart.')));
      localStorage.removeItem(constants.STORAGE_KEY);
    }
  }
}

function* addItem() {
  yield put(showSuccess(translate('Order item has been created.')));
  const workspace: WorkspaceType = yield select(getWorkspace);
  if (workspace === 'organization') {
    yield $state.go('marketplace-checkout-customer');
  } else {
    yield $state.go('marketplace-checkout');
  }
}

export default function*() {
  yield takeEvery(constants.ADD_ITEM, addItem);
  yield takeEvery(constants.CREATE_ORDER, createOrder);
  yield takeEvery([constants.ADD_ITEM, constants.REMOVE_ITEM], syncCart);
  yield takeEvery(INIT_CONFIG, restoreCart);
  yield takeEvery(constants.CLEAR_CART, clearCart);
}
