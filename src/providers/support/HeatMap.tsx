import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import loadLeafleat from '@waldur/shims/load-leaflet';

import { countryInfo } from './countryInfo';
import './HeatMap.scss';
import { getStyle, getChartData } from './HeatMapCalculator';
import { UsageData, Feature } from './types';

const loadCountries = () => import(/* webpackChunkName: "countries" */ './countries.geo.js');

interface HeatMapProps {
  center?: number[];
  zoom?: number;
  serviceUsage: UsageData;
  countriesToRender: string[];
}

export class HeatMap extends React.Component<HeatMapProps> {
  map = undefined;
  mapNode: HTMLDivElement;
  features: Feature[];
  leaflet = null;

  state = {
    loading: true,
    loaded: false,
  };

  componentDidMount() {
    this.loadAll().then(() => {
      this.initMap();
    });
  }

  componentDidUpdate() {
    if (this.leaflet) {
      if (!this.map) {
        this.initMap();
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

  async loadAll() {
    try {
      const { default: {features}} = await loadCountries();
      const { leaflet } = await loadLeafleat();
      this.setState({
        loading: false,
        loaded: true,
      });
      this.features = features;
      this.leaflet = leaflet;
    } catch {
      this.setState({
        loading: false,
        loaded: false,
      });
    }
  }

  initMap() {
    const { center, zoom } = this.props;
    this.map = this.leaflet.map(this.mapNode).setView(center, zoom);
    const layerUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const layerAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    this.leaflet.tileLayer(layerUrl, {attribution: layerAttrib}).addTo(this.map);
    this.updateMap();
  }

  updateMap() {
    const chartData = getChartData(
      this.props.serviceUsage,
      this.props.countriesToRender,
      this.features
    );
    if (chartData.length > 0) {
      const layer = this.leaflet.geoJson(chartData, {
        style: getStyle,
        onEachFeature: this.onEachFeature,
      });
      this.map.fitBounds(layer.getBounds());
      layer.addTo(this.map);
    }
  }

  onEachFeature(feature, layer) {
    const content = countryInfo({data: feature.properties.data});
    layer.bindPopup(content);
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    if (this.state.loaded) {
      return (<div ref={node => this.mapNode = node} id="heat-map"/>);
    }
  }
}
