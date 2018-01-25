import { FETCH_REQUEST, FETCH_SUCCESS, FETCH_FAILURE, FETCH_RESET } from './constants';

const INITIAL_STATE = {
  loading: false,
  loaded: false,
  erred: false,
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
    };

    case FETCH_FAILURE:
    return {
      loading: false,
      loaded: false,
      erred: true,
    };

    case FETCH_RESET:
    return INITIAL_STATE;

    default:
    return state;
  }
}
