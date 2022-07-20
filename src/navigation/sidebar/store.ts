import { call, put, select, takeEvery } from 'redux-saga/effects';

import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';

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

export const sidebarInitStart = () => ({
  type: SIDEBAR_INIT_START,
});

export const sidebarInitSuccess = (categories: Category[]) => ({
  type: SIDEBAR_INIT_SUCCESS,
  payload: {
    categories,
  },
});

export const getCategoriesSelector = (store) => store.sidebar.categories;

function* loadCategories() {
  const oldCategories = yield select(getCategoriesSelector);
  if (oldCategories.length > 0) {
    return;
  }
  try {
    const newCategories = yield call(getCategories, {
      params: {
        field: ['uuid', 'title'],
        has_offerings: true,
      },
    });
    yield put(sidebarInitSuccess(newCategories));
    // eslint-disable-next-line no-empty
  } catch {}
}

export function* sidebarSaga() {
  yield takeEvery(SIDEBAR_INIT_START, loadCategories);
}
