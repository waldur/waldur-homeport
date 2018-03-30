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
  selectServiceProvider: (uuid: string) => void;
  hideFilter: () => void;
}

export default class UsageMap extends React.Component<UsageMapProps> {
  map: any;

  componentDidMount() {
    this.map = L.map(this.props.id);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data !== this.props.data) {
      return true;
    }
    return false;
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
        this.props.selectServiceProvider(e.layer.feature.properties.provider_uuid);
        this.props.hideFilter();
        oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
      }
      if (e.sharedDestinationFeatures.length) {
        const content = e.layer.feature.properties.consumer_name;
        e.layer.setPopupContent(content);
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
