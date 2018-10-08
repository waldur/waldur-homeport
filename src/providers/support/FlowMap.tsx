import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import loadLeafleat from '@waldur/shims/load-leaflet';

import './FlowMap.scss';

const loadEsriLeaflet = () => import(/* webpackChunkName: "esri-leaflet" */ 'esri-leaflet');
const loadFlowmapLayer = () => import(/* webpackChunkName: "CanvasFlowmapLayer" */ './CanvasFlowmapLayer');

interface FlowMapProps {
  center?: number[];
  zoom?: number;
  data: any;
  selectServiceProvider: (uuid: string) => void;
  showInfoPanel: () => void;
}

export default class FlowMap extends React.Component<FlowMapProps> {
  mapNode = undefined;
  leaflet = undefined;
  map = undefined;
  oneToManyFlowmapLayer = undefined;
  basemapLayer = null;

  componentDidMount() {
    this.loadAll().then(() => {
      if (this.mapNode) {
        this.initMap(this.mapNode);
      }
      this.forceUpdate();
    });
  }

  async loadAll() {
    const { leaflet} = await loadLeafleat();
    this.leaflet = leaflet;

    await loadFlowmapLayer();

    const { basemapLayer } = await loadEsriLeaflet();
    this.basemapLayer = basemapLayer;
  }

  initMap(node) {
    this.map = this.leaflet.map(node);
    const { center, zoom } = this.props;
    this.map.setView(center, zoom);
    this.basemapLayer('Gray').addTo(this.map);
    this.updateMap();
  }

  componentDidUpdate() {
    if (this.leaflet) {
      if (!this.map) {
        this.initMap(this.mapNode);
      } else {
        this.updateMap();
      }
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
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
      this.oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
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
    this.oneToManyFlowmapLayer = this.setFlowmapLayer(geoJsonFeatureCollection);
    this.oneToManyFlowmapLayer.addTo(this.map);
    this.oneToManyFlowmapLayer.on('click', this.flowmapLaterClickHandler);
    if (bounds) {
      this.map.fitBounds(bounds);
    }
  }

  render() {
    if (!this.leaflet) {
      return  <LoadingSpinner />;
    }
    return (<div ref={node => this.mapNode = node} id="flow-map" />);
  }
}
