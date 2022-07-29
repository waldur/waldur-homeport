import { call, put, takeEvery } from 'redux-saga/effects';

import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const SIDEBAR_INIT_START = 'waldur/navigation/SIDEBAR_INIT_START';
const SIDEBAR_INIT_SUCCESS = 'waldur/navigation/SIDEBAR_INIT_SUCCESS';

export const sidebarReducer = (state = { categories: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case SIDEBAR_INIT_SUCCESS:
      return {
        ...state,
        categories: payload.categories,
      };

    default:
      return state;
  }
};

export const sidebarInitStart = (anonymous: Boolean = false) => ({
  type: SIDEBAR_INIT_START,
  payload: {
    anonymous,
  },
});

export const sidebarInitSuccess = (categories: Category[]) => ({
  type: SIDEBAR_INIT_SUCCESS,
  payload: {
    categories,
  },
});

export const getCategoriesSelector = (store) => store.sidebar.categories;

function* loadCategories(action) {
  const { anonymous } = action.payload;
  const anonymousConfig = anonymous ? ANONYMOUS_CONFIG : {};
  try {
    const newCategories = yield call(getCategories, {
      params: {
        field: ['uuid', 'title'],
        has_offerings: true,
      },
      ...anonymousConfig,
    });
    yield put(sidebarInitSuccess(newCategories));
    // eslint-disable-next-line no-empty
  } catch {}
}

export function* sidebarSaga() {
  yield takeEvery(SIDEBAR_INIT_START, loadCategories);
}
