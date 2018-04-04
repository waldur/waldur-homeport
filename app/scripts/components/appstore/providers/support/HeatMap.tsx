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
    this.getTotalMetricsDiff = this.getTotalMetricsDiff.bind(this);
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

  calculateTotalConsumerResources(data, country) {
    console.log(data, country);
    // needs to be implemented yet
  }

  getTotalMetricsDiff(data, country) {
    console.log(data, country);
    return 0;
    // needs to be implemented yet
  }

  updateMap() {
    const { data } = this.props;

    const consumers = Object.keys(data.service_providers).reduce((acc, providerUuid) => {
      countries.features.map(country => {
        if (country.properties.name === data.organizations[providerUuid].country) {
          acc.push({
            ...country,
            properties: {
              ...country.properties,
              diff: this.getTotalMetricsDiff(data, country.properties.name),
            },
          });
        }
      });
      return acc;
    }, []);

    if (consumers.length > 0) {
      const layer = L.geoJson(consumers, {style: this.setStyle});
      this.map.fitBounds(layer.getBounds());
      layer.addTo(this.map);
    }
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
    this.updateMap();
  }

  render() {
    return (<div id="heat-map"/>);
  }
}
