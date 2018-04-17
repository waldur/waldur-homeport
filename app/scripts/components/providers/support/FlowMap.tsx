import { basemapLayer } from 'esri-leaflet';
import * as React from 'react';

import loadLeafleat from '../../../shims/load-leaflet';
import './CanvasFlowmapLayer';

import './flow-map.scss';

interface FlowMapProps {
  center?: number[];
  zoom?: number;
  data: any;
  selectServiceProvider: (uuid: string) => void;
  showInfoPanel: () => void;
}

interface FlowMapState {
  map: any;
  oneToManyFlowmapLayer: any;
}

export default class FlowMap extends React.Component<FlowMapProps, FlowMapState> {
  mapNode = undefined;
  leaflet = undefined;

  constructor(props) {
    super(props);
    this.state = {
      map: null,
      oneToManyFlowmapLayer: null,
    };
  }

  componentWillMount() {
    loadLeafleat().then(module => {
      this.leaflet = module.leaflet;
      this.forceUpdate();
    });
  }

  componentDidMount() {
    if (!this.state.map && this.leaflet) {
      this.initMap(this.mapNode);
    }
  }

  initMap(node) {
    if (this.state.map) {
      return;
    }
    const map = this.leaflet.map(node);
    const { center, zoom } = this.props;
    map.setView(center, zoom);
    basemapLayer('Gray').addTo(map);
    this.setState({map}, this.updateMap);
  }

  componentDidUpdate() {
    if (!this.state.map && this.leaflet) {
      this.initMap(this.mapNode);
    }
    if (this.state.map && this.leaflet) {
      this.updateMap();
    }
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
    features: data.usage.reduce((features, entry) => {
      const provider_uuid = entry.provider_to_consumer.provider_uuid;
      const consumer_uuid = entry.provider_to_consumer.consumer_uuid;
      // if (!data.service_providers[consumer_uuid]) {
      features.push({
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
      });
      // }
      return features;
    }, []),
  })

  setFlowmapLayer(data) {
    if (this.leaflet) {
      return this.leaflet.canvasFlowmapLayer(data, {
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
    if (this.leaflet) {
      const bounds = this.leaflet.latLngBounds(center);
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
  }

  updateMap() {
    const { center, data } = this.props;
    const bounds = this.extendViewport(data, center);
    const geoJsonFeatureCollection = this.composeFeatureCollection(data);
    this.setState({
      oneToManyFlowmapLayer: this.setFlowmapLayer(geoJsonFeatureCollection),
    }, () => {
      this.state.oneToManyFlowmapLayer.addTo(this.state.map);
      this.state.oneToManyFlowmapLayer.on('click', this.flowmapLaterClickHandler);
    });
    if (bounds) {
      this.state.map.fitBounds(bounds);
    }
  }

  render() {
    return (<div ref={node => this.mapNode = node} id="usage-map" />);
  }
}
