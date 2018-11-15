import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { INIT_CONFIG } from '@waldur/store/config';
import { showError, showSuccess } from '@waldur/store/coreSaga';
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
  try {
    const items = yield call(api.getCartItems);
    yield put(actions.setCart({items}));
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
    yield put(showSuccess(translate('Item has been added to shopping cart.')));
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === 'organization') {
      yield $state.go('marketplace-checkout-customer');
    } else {
      yield $state.go('marketplace-checkout');
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to add item to shopping cart.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* removeItem(action) {
  try {
    yield call(api.removeCartItem, action.payload.uuid);
    yield put(actions.removeItemSuccess(action.payload.uuid));
    yield put(showSuccess(translate('Item has been removed from shopping cart.')));
  } catch (error) {
    const errorMessage = `${translate('Unable to remove item from shopping cart.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* createOrder() {
  const project = yield select(getProject);
  try {
    const order = yield call(api.submitCart, {project: project.url});
    yield put(showSuccess(translate('Order has been submitted.')));
    yield put(actions.clearCart());
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === 'organization') {
      yield $state.go('marketplace-order-details-customer', {order_uuid: order.uuid});
    } else {
      yield $state.go('marketplace-order-details', {order_uuid: order.uuid});
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to submit order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(INIT_CONFIG, initCart);
  yield takeEvery(constants.ADD_ITEM_REQUEST, addItem);
  yield takeEvery(constants.REMOVE_ITEM_REQUEST, removeItem);
  yield takeEvery(constants.CREATE_ORDER, createOrder);
}
