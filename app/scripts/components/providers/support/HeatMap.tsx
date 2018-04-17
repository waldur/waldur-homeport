import L from 'leaflet';
import * as React from 'react';

import countries from './countries.geo.js';
import { countryInfo } from './countryInfo';
import './heat-map.scss';
import HeatMapCalculator from './HeatMapCalculator';

interface HeatMapProps {
  center?: number[];
  zoom?: number;
  id: string;
  data: any;
  countriesToRender: any[];
}

export default class HeatMap extends React.Component<HeatMapProps> {
  map = undefined;
  heatMapCalculator = undefined;

  constructor(props) {
    super(props);
    this.heatMapCalculator = new HeatMapCalculator();
  }

  setStyle = feature => {
    return {
      fillColor: this.heatMapCalculator.getColor(feature.properties.diff),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  getDataForCountry(data, countryName) {
    return Object.keys(data.service_providers).reduce((acc, uuid) => {
      if (data.organizations[uuid].country === countryName) {
        acc.providers.push(data.organizations[uuid]);
      }
      data.service_providers[uuid].map(consumerUuid => {
        if (data.organizations[consumerUuid].country === countryName
          && acc.consumers.indexOf(data.organizations[consumerUuid]) === -1) {
          acc.consumers.push(data.organizations[consumerUuid]);
        }
      });
      return acc;
    }, {providers: [], consumers: []});
  }

  updateMap() {
    const { data } = this.props;
    const nameOfCountries = this.props.countriesToRender;
    const countriesToRender = [];
    nameOfCountries.map(countryName => {
      countries.features.map(country => {
        if (country.properties.name === countryName) {
          countriesToRender.push({
              ...country,
              properties: {
                ...country.properties,
                diff: this.heatMapCalculator.getTotalMetricsDiff(data, countryName),
                data: this.getDataForCountry(data, countryName),
              },
            });
          }
        });
    });
    if (countriesToRender.length > 0) {
      const layer = L.geoJson(countriesToRender, {
        style: this.setStyle,
        onEachFeature: this.onEachFeature,
      });
      this.map.fitBounds(layer.getBounds());
      layer.addTo(this.map);
    }
  }
  componentDidUpdate() {
    this.updateMap();
  }

  onEachFeature(feature, layer) {
    const content = countryInfo({data: feature.properties.data});
    layer.bindPopup(content);
  }

  componentDidMount() {
    const { id, center, zoom } = this.props;
    this.map = L.map(id).setView(center, zoom);
    const layerUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const layerAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    L.tileLayer(layerUrl, {attribution: layerAttrib}).addTo(this.map);
    this.updateMap();
  }

  render() {
    return (<div id="heat-map"/>);
  }
}
