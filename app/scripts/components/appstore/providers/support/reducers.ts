import * as actions from './actions';

// interface InitialStateInterface {
//   data: ServiceProvidersInterface;
//   loading: boolean;
//   selectedServiceProvider: any;
// }

const INITIAL_STATE = {
  data: {
    usage: [],
    service_providers: {},
    service_consumers: {},
  },
  selectedServiceProvider: {
    consumers: [],
  },
  loading: false,
  filter: true,
};

export function reducer(state = INITIAL_STATE, action) {
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
      let selectedServiceProvider;
      for (const key in state.data.service_providers) {
        if (state.data.service_providers.hasOwnProperty(key)) {
          if (state.data.service_providers[key].uuid === action.payload.uuid) {
            selectedServiceProvider = state.data.service_providers[key];
          }
        }
      }
      return {
        ...state,
        selectedServiceProvider,
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

    default:
      return state;
  }
}
