import CategoriesService from './categories-service';
import providerIcon from './provider-icon';
import { getServiceIcon, getTypeDisplay } from './registry';
import flowMapView from './support/FlowMapViewContainer';
import heatMap from './support/HeatMapContainer';
import sankeyDiagram from './support/SankeyDiagramContainer';

export default module => {
  module.component('providerIcon', providerIcon);
  module.service('ncServiceUtils', () => ({ getTypeDisplay, getServiceIcon }));
  module.service('CategoriesService', CategoriesService);
  module.component('flowMapView', flowMapView);
  module.component('heatMap', heatMap);
  module.component('sankeyDiagram', sankeyDiagram);
};
