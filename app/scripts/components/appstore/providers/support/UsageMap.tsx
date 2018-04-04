import { basemapLayer } from 'esri-leaflet';
import L from 'leaflet';
import * as React from 'react';

import './CanvasFlowmapLayer';

import './providers-support.scss';

interface UsageMapProps {
  center?: number[];
  zoom?: number;
  data: any;
  selectServiceProvider: (uuid: string) => void;
  showInfoPanel: () => void;
}

interface UsageMapState {
  map: any;
  oneToManyFlowmapLayer: any;
}

export default class UsageMap extends React.Component<UsageMapProps, UsageMapState> {
  mapNode: any;

  constructor(props) {
    super(props);
    this.state = {
      map: null,
      oneToManyFlowmapLayer: null,
    };
  }

  componentDidMount() {
    if (!this.state.map) {
      this.initMap(this.mapNode);
    }
  }

  initMap(node) {
    if (this.state.map) {
      return;
    }
    const map = L.map(node);
    const { center, zoom } = this.props;
    map.setView(center, zoom);
    basemapLayer('Gray').addTo(map);

    this.setState({map}, this.updateMap);
  }

  componentDidUpdate() {
    this.updateMap();
  }

  componentWillUnmount() {
    this.state.map.remove();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data !== this.props.data) {
      return true;
    }
    return false;
  }

  composeFeatureCollection = data => ({
    type: 'FeatureCollection',
    features: data.usage.map(entry => {
      const provider_uuid = entry.provider_to_consumer.provider_uuid;
      const consumer_uuid = entry.provider_to_consumer.consumer_uuid;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            data.organizations[provider_uuid].longitude,
            data.organizations[provider_uuid].latitude,
          ],
        },
        properties: {
          ...entry.provider_to_consumer,
          provider_longitude: data.organizations[provider_uuid].longitude,
          provider_latitude: data.organizations[provider_uuid].latitude,
          consumer_longitude: data.organizations[consumer_uuid].longitude,
          consumer_latitude: data.organizations[consumer_uuid].latitude,
          consumer_name: data.organizations[consumer_uuid].name,
        },
      };
    },
    ),
  })

  setFlowmapLayer(data) {
    return L.canvasFlowmapLayer(data, {
      originAndDestinationFieldIds: {
        originUniqueIdField: 'provider_uuid',
        originGeometry: {
          x: 'provider_longitude',
          y: 'provider_latitude',
        },
        destinationUniqueIdField: 'consumer_uuid',
        destinationGeometry: {
          x: 'consumer_longitude',
          y: 'consumer_latitude',
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
      this.state.oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
    }
    if (e.sharedDestinationFeatures.length) {
      const content = e.layer.feature.properties.consumer_name;
      e.layer.setPopupContent(content);
    }
  }

  extendViewport(data, center) {
    const bounds = L.latLngBounds(center);

    for (const key in data.organizations) {
      if (data.organizations.hasOwnProperty(key)) {
        bounds.extend([
          data.organizations[key].latitude,
          data.organizations[key].longitude,
        ]);
      }
    }
    return bounds;
  }

  updateMap() {
    const { center, data } = this.props;
    const bounds = this.extendViewport(data, center);
    const geoJsonFeatureCollection = this.composeFeatureCollection(data);
    console.log("GeoData", geoJsonFeatureCollection);
    this.setState({
      oneToManyFlowmapLayer: this.setFlowmapLayer(geoJsonFeatureCollection),
    }, () => {
      this.state.oneToManyFlowmapLayer.addTo(this.state.map);
      this.state.oneToManyFlowmapLayer.on('click', this.flowmapLaterClickHandler);
    });
    if (Object.keys(bounds).length > 0) {
      this.state.map.fitBounds(bounds);
    }
  }

  render() {
    return (<div ref={node => this.mapNode = node} id="usage-map" />);
  }
}
