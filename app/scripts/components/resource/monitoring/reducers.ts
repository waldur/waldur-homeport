import { FETCH_REQUEST, FETCH_SUCCESS, FETCH_FAILURE } from './constants';

const INITIAL_STATE = {
  loading: false,
  loaded: false,
  erred: false,
  host: undefined,
};

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_REQUEST:
    return {
      loading: true,
      loaded: false,
      erred: false,
    };

    case FETCH_SUCCESS:
    return {
      loading: false,
      loaded: true,
      erred: false,
      host: action.payload.host,
    };

    case FETCH_FAILURE:
    return {
      loading: false,
      loaded: false,
      erred: true,
    };

    default:
    return state;
  }
}
