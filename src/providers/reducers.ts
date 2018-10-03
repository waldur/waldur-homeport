import { FETCH_PROVIDER_REQUEST, FETCH_PROVIDER_SUCCESS, FETCH_PROVIDER_FAILURE } from './actions';
import { ProviderUpdateFormData } from './types';

const INITIAL_STATE: ProviderUpdateFormData = {
  loaded: false,
  erred: false,
  provider: undefined,
};

export function reducer(state = INITIAL_STATE, action): ProviderUpdateFormData {
  switch (action.type) {
    case FETCH_PROVIDER_REQUEST:
    return INITIAL_STATE;

    case FETCH_PROVIDER_SUCCESS:
    return {
      loaded: true,
      erred: false,
      provider: action.payload.provider,
    };

    case FETCH_PROVIDER_FAILURE:
    return {
      loaded: false,
      erred: true,
    };

    default:
    return state;
  }
}

export const getProviderUpdateState = (state: any): ProviderUpdateFormData => state.provider;
