import { LatLngTuple } from 'leaflet';
import * as React from 'react';
import { MapContainer, useMap } from 'react-leaflet';

import { EsriLayer } from '@waldur/map/EsriLayer';

import './FlowMap.scss';
import { UsageData } from './types';
import { getFlowmapLayer } from './utils';

interface FlowMapProps {
  center?: LatLngTuple;
  zoom?: number;
  data: UsageData;
  selectServiceProvider: (uuid: string) => void;
  showInfoPanel: () => void;
}

const FlowmapLayer: React.FC<FlowMapProps> = (props) => {
  const map = useMap();
  React.useEffect(() => {
    const layer = getFlowmapLayer(props.data);
    layer.addTo(map);

    const clickHandler = (e) => {
      if (e.sharedOriginFeatures.length) {
        props.selectServiceProvider(e.layer.feature.properties.provider_uuid);
        props.showInfoPanel();
        layer['selectFeaturesForPathDisplay'](
          e.sharedOriginFeatures,
          'SELECTION_NEW',
        );
      }
      if (e.sharedDestinationFeatures.length) {
        const content = e.layer.feature.properties.consumer_name;
        e.layer.setPopupContent(content);
      }
    };
    layer.on('click', clickHandler);
    return () => {
      layer.removeFrom(map);
    };
  }, [props, map]);

  return null;
};

export const FlowMap: React.FC<FlowMapProps> = (props) => (
  <MapContainer zoom={props.zoom} center={props.center}>
    <EsriLayer />
    <FlowmapLayer
      data={props.data}
      selectServiceProvider={props.selectServiceProvider}
      showInfoPanel={props.showInfoPanel}
    />
  </MapContainer>
);
