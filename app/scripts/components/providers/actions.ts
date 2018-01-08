import { createFormAction } from 'redux-form-saga';

export const createProvider = createFormAction('waldur/provider/CREATE');
export const updateProvider = createFormAction('waldur/provider/UPDATE');
export const gotoProvidersList = createFormAction('waldur/provider/GOTO_LIST');

export const FETCH_PROVIDER_REQUEST = 'waldur/provider/FETCH_PROVIDER_REQUEST';
export const FETCH_PROVIDER_SUCCESS = 'waldur/provider/FETCH_PROVIDER_SUCCESS';
export const FETCH_PROVIDER_FAILURE = 'waldur/provider/FETCH_PROVIDER_FAILURE';

export const fetchProviderRequest = uuid => ({
  type: FETCH_PROVIDER_REQUEST,
  payload: {uuid},
});

export const fetchProviderSuccess = provider => ({
  type: FETCH_PROVIDER_SUCCESS,
  payload: {provider},
});

export const fetchProviderFailure = () => ({
  type: FETCH_PROVIDER_FAILURE,
});
