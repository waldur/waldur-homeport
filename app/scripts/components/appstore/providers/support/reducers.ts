import * as actions from './actions';

// interface InitialStateInterface {
//   data: ServiceProvidersInterface;
//   loading: boolean;
//   selectedServiceProvider: any;
// }

const INITIAL_STATE = {
  data: {
    organizations: {},
    service_providers: {},
    usage: [],
  },
  selectedServiceProvider: {},
  loading: false,
  infoPanelIsVisible: false,
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
      const providerUuid = action.payload.uuid;
      const serviceProvider = state.data.organizations[providerUuid];
      const selectedServiceConsumers = [];

      state.data.usage.forEach(entry => {
        const consumerUuid = entry.provider_to_consumer.consumer_uuid;
        if (providerUuid === entry.provider_to_consumer.provider_uuid) {
            selectedServiceConsumers.push({
              ...entry.data,
              name: state.data.organizations[consumerUuid].name,
            });
        }
      });
      selectedServiceProvider = {
        ...serviceProvider,
        consumers: selectedServiceConsumers,
      };
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

    case actions.USAGE_DATA_CLEAN:
      return {
        ...state,
        INITIAL_STATE,
      };

    default:
      return state;
  }
}
