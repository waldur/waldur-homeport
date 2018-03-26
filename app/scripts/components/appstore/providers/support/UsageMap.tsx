import { basemapLayer } from 'esri-leaflet';
import L from 'leaflet';
import * as React from 'react';

import './CanvasFlowmapLayer';

import './providers-support.scss';

interface UsageMapProps {
  center?: number[];
  zoom?: number;
  id: string;
  data: any;
  serviceProviderSelect: (uuid: string) => void;
}

interface UsageMapState {
  map: any;
}

export default class UsageMap extends React.Component<UsageMapProps, UsageMapState> {
  map: any;

  componentDidMount() {
    this.map = L.map(this.props.id);
  }

  updateMap() {
    const { center, zoom, data } = this.props;
    const bounds = L.latLngBounds(center);

    for (const key in data.service_providers) {
      if (data.service_providers.hasOwnProperty(key)) {
        bounds.extend([
          data.service_providers[key].latitude,
          data.service_providers[key].longitude,
        ]);
      }
    }

    for (const key in data.service_consumers) {
      if (data.service_consumers.hasOwnProperty(key)) {
        bounds.extend([
          data.service_consumers[key].latitude,
          data.service_consumers[key].longitude,
        ]);
      }
    }

    this.map.setView(center, zoom);

    this.map.fitBounds(bounds);

    basemapLayer('Gray').addTo(this.map);

    const geoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: data.usage.map(entry => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            entry.provider_to_consumer.provider_lon,
            entry.provider_to_consumer.provider_lat,
          ],
        },
        properties: entry.provider_to_consumer,
      })),
    };

    const oneToManyFlowmapLayer = L.canvasFlowmapLayer(geoJsonFeatureCollection, {
      originAndDestinationFieldIds: {
        originUniqueIdField: 'provider_uuid',
        originGeometry: {
          x: 'provider_lon',
          y: 'provider_lat',
        },
        destinationUniqueIdField: 'consumer_uuid',
        destinationGeometry: {
          x: 'consumer_lon',
          y: 'consumer_lat',
        },
      },
      pathDisplayMode: 'selection',
      animationStarted: true,
      animationEasingFamily: 'Cubic',
      animationEasingType: 'In',
      animationDuration: 2000,
    }).addTo(this.map);

    oneToManyFlowmapLayer.on('click', e => {
      if (e.sharedOriginFeatures.length) {
        this.props.serviceProviderSelect(e.layer.feature.properties.provider_uuid);
        oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
      }
      if (e.sharedDestinationFeatures.length) {
        oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, 'SELECTION_NEW');
      }
    });
  }

  componentDidUpdate() {
    this.updateMap();
  }

  render() {
    return (<div id="usage-map"/>);
  }
}
