import * as constants from './constants';

export const summaryResourceFetch = (url: string) => ({
  type: constants.SUMMARY_RESOURCE_FETCH,
  payload: {
    url,
  },
});

export const summaryResourceFetchStart = () => ({
  type: constants.SUMMARY_RESOURCE_FETCH_START,
});

export const summaryResourceFetchSuccess = (resource: string) => ({
  type: constants.SUMMARY_RESOURCE_FETCH_SUCCESS,
  payload: {
    resource,
  },
});

export const summaryResourceFetchError = (error: Response) => ({
  type: constants.SUMMARY_RESOURCE_FETCH_ERROR,
  payload: {
    error,
  },
});
