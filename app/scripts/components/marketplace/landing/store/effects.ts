import { call, put, takeEvery } from 'redux-saga/effects';

import * as api from '../../common/api';
import * as actions from './actions';
import * as constants from './constants';

function* getCategories() {
  yield put(actions.setCategoriesLoadingState({loading: true}));
  try {
    const categories = yield call(api.getCategories);
    yield put(actions.setCategories(categories));
    yield put(actions.setCategoriesLoadingState({loading: false, loaded: true}));
  } catch {
    yield put(actions.setCategoriesLoadingState({loading: false, loaded: false}));
  }
}

function* getProducts() {
  yield put(actions.setProductsLoadingState({loading: true}));
  try {
    const products = yield call(api.getProducts);
    yield put(actions.setProducts(products));
    yield put(actions.setProductsLoadingState({loading: false, loaded: true}));
  } catch {
    yield put(actions.setProductsLoadingState({loading: false, loaded: false}));
  }
}

export default function*() {
  yield takeEvery(constants.GET_CATEGORIES, getCategories);
  yield takeEvery(constants.GET_PRODUCTS, getProducts);
}
