import { FETCH_REQUEST, FETCH_SUCCESS, FETCH_FAILURE } from './constants';

export const fetchMonitoring = scope => ({
  type: FETCH_REQUEST,
  payload: {
    scope,
  },
});

export const fetchSuccess = () => ({
  type: FETCH_SUCCESS,
});

export const fetchFailure = () => ({
  type: FETCH_FAILURE,
});
