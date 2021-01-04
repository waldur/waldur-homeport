import {
  Organizations,
  ServiceProviders,
  Usage,
} from '@waldur/providers/support/types';

import * as actions from './actions';

interface ProviderState {
  data: {
    organizations: Organizations;
    service_providers: ServiceProviders;
    usage: Usage[];
  };
  selectedServiceProviderUuid: string;
  loading: boolean;
  infoPanelIsVisible: boolean;
  error?: any;
}

const INITIAL_STATE: ProviderState = {
  data: {
    organizations: {},
    service_providers: {},
    usage: [],
  },
  selectedServiceProviderUuid: null,
  loading: false,
  infoPanelIsVisible: false,
};

export function reducer(
  state: ProviderState = INITIAL_STATE,
  action,
): ProviderState {
  switch (action.type) {
    case actions.SERVICE_USAGE_FETCH_START:
      return {
        ...state,
        loading: true,
      };

    case actions.SERVICE_USAGE_FETCH_DONE:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };

    case actions.SERVICE_SELECT:
      return {
        ...state,
        selectedServiceProviderUuid: action.payload.uuid,
      };

    case actions.SERVICE_USAGE_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case actions.INFO_PANEL_SHOW:
      return {
        ...state,
        infoPanelIsVisible: true,
      };

    case actions.INFO_PANEL_HIDE:
      return {
        ...state,
        infoPanelIsVisible: false,
      };

    case actions.USAGE_DATA_CLEAN:
      return {
        ...state,
        ...INITIAL_STATE,
      };

    default:
      return state;
  }
}
