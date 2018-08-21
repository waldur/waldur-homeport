import { call, put, takeEvery } from 'redux-saga/effects';

import * as api from '../../common/api';
import * as actions from './actions';
import * as constants from './constants';

function* getCategories() {
  yield put(actions.setLoadingState({loading: true}));
  try {
    const categories = yield call(api.getCategories);
    yield put(actions.setCategories(categories));
    yield put(actions.setLoadingState({loading: false, loaded: true}));
  } catch {
    yield put(actions.setLoadingState({loading: false, loaded: false}));
  }
}

export default function*() {
  yield takeEvery(constants.GET_CATEGORIES, getCategories);
}
