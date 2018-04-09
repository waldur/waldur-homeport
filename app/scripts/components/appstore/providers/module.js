import AppstoreProvidersService from './appstore-providers-service';
import appstoreProviders from './appstore-providers';
import appstoreProvidersEmptyMessage from './appstore-providers-empty-message';
import flowMapView from './support/FlowMapViewContainer';
import heatMap from './support/HeatMapContainer';
import sankeyDiagram from './support/SankeyDiagramContainer';

export default module => {
  module.service('AppstoreProvidersService', AppstoreProvidersService);
  module.component('appstoreProviders', appstoreProviders);
  module.component('appstoreProvidersEmptyMessage', appstoreProvidersEmptyMessage);
  module.component('flowMapView', flowMapView);
  module.component('heatMap', heatMap);
  module.component('sankeyDiagram', sankeyDiagram);
};
