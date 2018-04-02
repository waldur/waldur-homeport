import L from 'leaflet';
import * as React from 'react';

import countries from './countries.geo.js';

import './providers-support.scss';

interface HeatMapProps {
  center?: number[];
  zoom?: number;
  id: string;
  data: any;
}

export default class HeatMap extends React.Component<HeatMapProps> {
  map: any;

  constructor(props) {
    super(props);
    this.getColor = this.getColor.bind(this);
    this.setStyle = this.setStyle.bind(this);
    this.getConsumerToProviderDiff = this.getConsumerToProviderDiff.bind(this);
  }

  getColor(diff) {
    if (diff < -1) {
      return '#1BBBE3';
    } else if (diff < 0) {
      return '#FF4233';
    } else {
      return '#FF4233';
    }
  }

  setStyle(feature) {
    return {
      fillColor: this.getColor(feature.properties.diff),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  getConsumerToProviderDiff(data, country) {
    let numOfProviders = 0;
    let numOfConsumers = 0;
    Object.keys(data.service_providers).forEach(key => {
      if (data.service_providers[key].country === country) {
        numOfProviders += 1;
      }
    });
    Object.keys(data.service_consumers).forEach(key => {
      if (data.service_consumers[key].country === country) {
        numOfConsumers += 1;
      }
    });
    return numOfProviders - numOfConsumers;
  }

  updateMap() {
    const { data } = this.props;

    const consumers = Object.keys(data.service_consumers).reduce((acc, key) => {
      if (!data.service_providers[key]) {
        countries.features.map(country => {
          if (country.properties.name === data.service_consumers[key].country) {
            acc.push({
              ...country,
              properties: {
                ...country.properties,
                diff: this.getConsumerToProviderDiff(data, country.properties.name),
              },
            });
          }
        });
      }
      return acc;
    }, []);

    const layer = L.geoJson(consumers, {style: this.setStyle});
    this.map.fitBounds(layer.getBounds());
    layer.addTo(this.map);
  }
  componentDidUpdate() {
    this.updateMap();
  }
  componentDidMount() {
    const { id, center, zoom } = this.props;
    this.map = L.map(id).setView(center, zoom);
    const layerUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const layerAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    L.tileLayer(layerUrl, {attribution: layerAttrib}).addTo(this.map);
  }

  render() {
    return (<div id="usage-map"/>);
  }
}
