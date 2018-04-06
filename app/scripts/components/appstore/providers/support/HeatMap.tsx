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
    if (diff > 0) {
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
    return data.usage.reduce((total, entry) => {
      const consumerUuid = entry.provider_to_consumer.consumer_uuid;
      if (data.organizations[consumerUuid].country === country) {
        total += entry.data.cpu;
        total += entry.data.gpu;
        total += entry.data.ram;
      }
      return total;
    }, 0);
  }

  calculateTotalProviderResources(data, country) {
    return data.usage.reduce((total, entry) => {
      const providerUuid = entry.provider_to_consumer.provider_uuid;
      if (data.organizations[providerUuid].country === country) {
        total += entry.data.cpu;
        total += entry.data.gpu;
        total += entry.data.ram;
      }
      return total;
    }, 0);
  }

  getTotalMetricsDiff(data, country) {
    const totalProviderMetrics = this.calculateTotalProviderResources(data, country);
    const totalConsumerMetrics = this.calculateTotalConsumerResources(data, country);
    return totalProviderMetrics - totalConsumerMetrics;
  }

  getCountriesToRender(data) {
    return Object.keys(data.service_providers).reduce((acc, providerUuid) => {
      const countryOfProvider = data.organizations[providerUuid].country;
      if (acc.indexOf(countryOfProvider) === -1) {
        acc.push(countryOfProvider);
      }
      const countriesOfConsumers = data.service_providers[providerUuid];
      countriesOfConsumers.map(consumerUuid => {
        const countryOfConsumer = data.organizations[consumerUuid].country;
        if (acc.indexOf(countryOfConsumer) === -1) {
          acc.push(countryOfConsumer);
        }
      });
      return acc;
    }, []);
  }

  getDataForCountry(data, countryName) {
    return Object.keys(data.service_providers).reduce((acc, uuid) => {
      if (data.organizations[uuid].country === countryName) {
        acc.push(data.organizations[uuid]);
      }
      return acc;
    }, []);
  }

  updateMap() {
    const { data } = this.props;
    const nameOfCountries = this.getCountriesToRender(data);
    const countriesToRender = [];
    nameOfCountries.map(countryName => {
      countries.features.map(country => {
        if (country.properties.name === countryName) {
          countriesToRender.push({
              ...country,
              properties: {
                ...country.properties,
                diff: this.getTotalMetricsDiff(data, countryName),
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
    console.log('feature', feature);
    layer.bindPopup('Provider\'s data');
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
