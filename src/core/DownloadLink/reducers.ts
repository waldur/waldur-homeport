import {
  DOWNLOAD_REQUEST,
  DOWNLOAD_SUCCESS,
  DOWNLOAD_FAILURE,
  DOWNLOAD_RESET,
} from './constants';

const INITIAL_STATE = {
  loading: false,
  loaded: false,
  erred: false,
};

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case DOWNLOAD_REQUEST:
      return {
        loading: true,
        loaded: false,
        erred: false,
      };

    case DOWNLOAD_SUCCESS:
      return {
        loading: false,
        loaded: true,
        erred: false,
      };

    case DOWNLOAD_FAILURE:
      return {
        loading: false,
        loaded: false,
        erred: true,
      };

    case DOWNLOAD_RESET:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const getDownloadLinkState = state => state.downloadLink;
