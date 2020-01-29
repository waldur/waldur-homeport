import { getServiceIcon, getTypeDisplay } from './registry';
import flowMapView from './support/FlowMapViewContainer';
import heatMap from './support/HeatMapContainer';
import sankeyDiagram from './support/SankeyDiagramContainer';
import detailsModule from './details/module';
import providerIcon from './provider-icon';
import CategoriesService from './categories-service';

export default module => {
  module.component('providerIcon', providerIcon);
  module.service('ncServiceUtils', () => ({ getTypeDisplay, getServiceIcon }));
  module.service('CategoriesService', CategoriesService);
  module.component('flowMapView', flowMapView);
  module.component('heatMap', heatMap);
  module.component('sankeyDiagram', sankeyDiagram);
  detailsModule(module);
};
