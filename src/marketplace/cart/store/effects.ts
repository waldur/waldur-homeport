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
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  SET_CURRENT_PROJECT,
  SET_CURRENT_CUSTOMER,
} from '@waldur/workspace/constants';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import * as actions from './actions';
import * as constants from './constants';
import { getItems } from './selectors';

const flattenAttributes = (attributes) => {
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
      if (workspace === WorkspaceType.ORGANIZATION) {
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

export default function* () {
  yield takeLatest([SET_CURRENT_PROJECT, SET_CURRENT_CUSTOMER], initCart);
  yield takeEvery(constants.ADD_ITEM_REQUEST, addItem);
}
