import { triggerTransition } from '@uirouter/redux';
import moment from 'moment';
import { delay } from 'redux-saga';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { showError, showSuccess } from '@waldur/store/notify';
import {
  SET_CURRENT_PROJECT,
  SET_CURRENT_CUSTOMER,
} from '@waldur/workspace/constants';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType, ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import * as actions from './actions';
import * as constants from './constants';

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

/* Since back-end doesn't allow slots in the past,
 * this function detects slots that are in the past and
 * sets the time to 20 minutes later in the future.
 * We add a small buffer that corresponds to max time spend on creating a booking
 */
const handlePastSlots = (attributes) => {
  const currentTime = moment().format();
  const currentTimePlus20Minutes = moment().add(20, 'minutes').format();
  const schedules = attributes.schedules.map((schedule) =>
    moment(schedule.start).isBefore(currentTime)
      ? {
          ...schedule,
          start: currentTimePlus20Minutes,
        }
      : schedule,
  );
  return {
    ...attributes,
    schedules,
  };
};

const formatItem = (item) => ({
  plan: item.plan ? item.plan.url : undefined,
  project: item.project,
  attributes: flattenAttributes(handlePastSlots(item.attributes)),
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
  if (!isFeatureVisible('marketplace')) {
    return;
  }
  // Wait a little bit to avoid race conditions
  yield call(delay, 500);
  const project = yield select(getProject);
  if (!project) {
    yield put(actions.setItems([]));
    return;
  }
  try {
    const items = yield call(api.getCartItems, project.url);
    yield put(actions.setItems(items));
  } catch (error) {
    if (error.status === -1 || error.status === 401) {
      return;
    }
    const errorMessage = `${translate(
      'Unable to initialize shopping cart.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* addItem(action) {
  try {
    const item = yield call(
      api.addCartItem,
      formatItemToCreate(action.payload.item),
    );
    yield put(actions.addItemSuccess(item));

    const items = yield call(api.getCartItems, item.project);
    yield put(actions.setItems(items));

    yield put(showSuccess(translate('Item has been added to shopping cart.')));
    yield put(
      triggerTransition('marketplace-checkout', { uuid: item.project_uuid }),
    );
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to add item to shopping cart.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(actions.addItemError());
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
    const errorMessage = `${translate(
      'Unable to remove item from shopping cart.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
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
    const errorMessage = `${translate(
      'Unable to update shopping cart item.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
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
        triggerTransition('marketplace-order-details', {
          order_uuid: order.uuid,
        }),
      );
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to submit order.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
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
