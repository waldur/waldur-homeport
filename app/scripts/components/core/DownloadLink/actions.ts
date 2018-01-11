import { DOWNLOAD_REQUEST, DOWNLOAD_SUCCESS, DOWNLOAD_FAILURE } from './constants';

export const downloadRequest = (url, filename) => ({
  type: DOWNLOAD_REQUEST,
  payload: {url, filename},
});

export const downloadSuccess = () => ({
  type: DOWNLOAD_SUCCESS,
});

export const downloadFailure = () => ({
  type: DOWNLOAD_FAILURE,
});
