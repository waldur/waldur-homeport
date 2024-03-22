import { triggerTransition } from '@uirouter/redux';
import {
  call,
  delay,
  put,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { OrderResponse } from '@waldur/marketplace/orders/types';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';
import {
  SET_CURRENT_PROJECT,
  SET_CURRENT_CUSTOMER,
} from '@waldur/workspace/constants';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType, ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import * as actions from './actions';
import * as constants from './constants';
import { getItems } from './selectors';

export const flattenAttributes = (attributes) => {
  let newAttributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    newAttributes = {
      ...newAttributes,
      [key]:
        typeof value === 'object' && !Array.isArray(value)
          ? value['value']
          : value,
    };
  }
  return newAttributes;
};

const formatItem = (item) => ({
  plan: item.plan ? item.plan.url : undefined,
  project: item.project,
  attributes: flattenAttributes(item.attributes),
  limits: item.limits,
});

const formatItemToCreate = (item) => ({
  offering: item.offering.url,
  ...formatItem(item),
});

const formatItemToUpdate = (item) => ({
  uuid: item.shoppingCartItemUuid,
  ...formatItem(item),
});

function* initCart() {
  // Wait a little bit to avoid race conditions
  yield delay(500);
  const project = yield select(getProject);
  if (!project) {
    yield put(actions.setItems([]));
    return;
  }
  try {
    const items = yield call(api.getCartItems, project.url);
    yield put(actions.setItems(items));
  } catch (error) {
    if ([-1, 401].includes(error.response?.status)) {
      return;
    }
    yield put(
      showErrorResponse(
        error,
        translate('Unable to initialize shopping cart.'),
      ),
    );
  }
}

function* addItem(action) {
  // Clear cart so that there's only one item per project
  const cartItems: OrderResponse[] = yield select(getItems);
  if (cartItems) {
    for (const item of cartItems) {
      if (item.uuid && item.project === action.payload.item.project) {
        yield call(api.removeCartItem, item.uuid);
        yield put(actions.removeItemSuccess(item.uuid));
      }
    }
  }
  let cartItem: OrderResponse;
  try {
    cartItem = yield call(
      api.addCartItem,
      formatItemToCreate(action.payload.item),
    );
    yield put(actions.addItemSuccess(cartItem));
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to add item to shopping cart.'),
      ),
    );
    yield put(actions.addItemError());
  }

  if (cartItem && cartItem.type === 'Create') {
    try {
      const order: OrderResponse = yield call(api.submitCart, {
        project: cartItem.project,
      });
      yield put(showSuccess(translate('Order has been submitted.')));
      yield put(actions.createOrderSuccess());
      const workspace: WorkspaceType = yield select(getWorkspace);
      let resourceDetailsLinkState;
      let parentUuid;
      if (workspace === ORGANIZATION_WORKSPACE) {
        resourceDetailsLinkState = 'marketplace-provider-resource-details';
        parentUuid = order.customer_uuid;
      } else {
        resourceDetailsLinkState = 'marketplace-project-resource-details';
        parentUuid = order.project_uuid;
      }
      yield put(
        triggerTransition(resourceDetailsLinkState, {
          uuid: parentUuid,
          resource_uuid: order.marketplace_resource_uuid,
        }),
      );
    } catch (error) {
      yield put(showErrorResponse(error, translate('Unable to submit order.')));
      yield put(actions.createOrderError());
    }
  }
}

function* removeItem(action) {
  try {
    yield call(api.removeCartItem, action.payload.uuid);
    yield put(actions.removeItemSuccess(action.payload.uuid));

    const items = yield call(api.getCartItems, action.payload.project);
    yield put(actions.setItems(items));

    yield put(
      showSuccess(translate('Item has been removed from shopping cart.')),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to remove item from shopping cart.'),
      ),
    );
    yield put(actions.removeItemError());
  }
}

function* updateItem(action) {
  try {
    const item = yield call(
      api.updateCartItem,
      action.payload.item.uuid,
      formatItemToUpdate(action.payload.item),
    );
    yield put(actions.updateItemSuccess(item));

    const items = yield call(api.getCartItems, action.payload.item.project);
    yield put(actions.setItems(items));

    yield put(showSuccess(translate('Shopping cart item has been updated.')));
    yield put(
      triggerTransition('marketplace-checkout', { uuid: item.project_uuid }),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to update shopping cart item.'),
      ),
    );
    yield put(actions.updateItemError());
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
    const order = yield call(api.submitCart, { project: project.url });
    yield put(showSuccess(translate('Order has been submitted.')));
    yield put(actions.createOrderSuccess());
    const workspace: WorkspaceType = yield select(getWorkspace);
    if (workspace === ORGANIZATION_WORKSPACE) {
      yield put(
        triggerTransition('marketplace-order-details-customer', {
          order_uuid: order.uuid,
        }),
      );
    } else {
      yield put(
        triggerTransition('marketplace-order-details-project', {
          order_uuid: order.uuid,
        }),
      );
    }
  } catch (error) {
    yield put(showErrorResponse(error, translate('Unable to submit order.')));
    yield put(actions.createOrderError());
  }
}

export default function* () {
  yield takeLatest([SET_CURRENT_PROJECT, SET_CURRENT_CUSTOMER], initCart);
  yield takeEvery(constants.ADD_ITEM_REQUEST, addItem);
  yield takeEvery(constants.UPDATE_ITEM_REQUEST, updateItem);
  yield takeEvery(constants.REMOVE_ITEM_REQUEST, removeItem);
  yield takeEvery(constants.CREATE_ORDER_REQUEST, createOrder);
}
