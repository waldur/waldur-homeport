import flowMapView from './support/FlowMapViewContainer';
import heatMap from './support/HeatMapContainer';
import sankeyDiagram from './support/SankeyDiagramContainer';

export default module => {
  module.component('flowMapView', flowMapView);
  module.component('heatMap', heatMap);
  module.component('sankeyDiagram', sankeyDiagram);
};
