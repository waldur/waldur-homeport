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
  showInfoPanel: () => void;
}

export default class UsageMap extends React.Component<UsageMapProps> {
  map: any;
  oneToManyFlowmapLayer: any;

  componentDidMount() {
    console.log('Mounted');
    this.initMap();
    this.updateMap();
  }

  initMap() {
    const { id, center, zoom } = this.props;
    this.map = L.map(id);
    this.map.setView(center, zoom);
    basemapLayer('Gray').addTo(this.map);
  }

  componentDidUpdate() {
    console.log('Updated');
    this.updateMap();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data !== this.props.data) {
      return true;
    }
    return false;
  }

  composeFeatureCollection = data => ({
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
  })

  setFlowmapLayer(data) {
    return L.canvasFlowmapLayer(data, {
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
    });
  }

  flowmapLaterClickHandler = e => {
    if (e.sharedOriginFeatures.length) {
      this.props.selectServiceProvider(e.layer.feature.properties.provider_uuid);
      this.props.showInfoPanel();
      this.oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
    }
    if (e.sharedDestinationFeatures.length) {
      const content = e.layer.feature.properties.consumer_name;
      e.layer.setPopupContent(content);
    }
  }

  extendViewport(data, center) {
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
    return bounds;
  }

  updateMapShallow() {
    const { center, data } = this.props;
    const bounds = this.extendViewport(data, center);
    if (this.oneToManyFlowmapLayer) {
      this.oneToManyFlowmapLayer.addTo(this.map);
    }
    if (Object.keys(bounds).length > 0) {
      this.map.fitBounds(bounds);
    }
  }

  updateMap() {
    const { center, data } = this.props;
    const bounds = this.extendViewport(data, center);
    const geoJsonFeatureCollection = this.composeFeatureCollection(data);
    this.oneToManyFlowmapLayer = this.setFlowmapLayer(geoJsonFeatureCollection);
    this.oneToManyFlowmapLayer.addTo(this.map);
    this.oneToManyFlowmapLayer.on('click', this.flowmapLaterClickHandler);

    if (Object.keys(bounds).length > 0) {
      this.map.fitBounds(bounds);
    }
  }

  render() {
    return (<div id="usage-map"/>);
  }
}
