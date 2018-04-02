import AppstoreProvidersService from './appstore-providers-service';
import appstoreProviders from './appstore-providers';
import appstoreProvidersEmptyMessage from './appstore-providers-empty-message';
import usageMapView from './support/UsageMapViewContainer';
import heatMap from './support/HeatMapContainer';

export default module => {
  module.service('AppstoreProvidersService', AppstoreProvidersService);
  module.component('appstoreProviders', appstoreProviders);
  module.component('appstoreProvidersEmptyMessage', appstoreProvidersEmptyMessage);
  module.component('usageMapView', usageMapView);
  module.component('heatMap', heatMap);
};
