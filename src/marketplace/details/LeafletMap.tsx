import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Geolocations } from '@waldur/marketplace/types';
import loadLeafleat from '@waldur/shims/load-leaflet';
import './LeafletMap.scss';

interface LeafletMapProps {
  positions: Geolocations;
}

export class LeafletMap extends React.Component<LeafletMapProps> {
  map = undefined;
  mapNode: HTMLDivElement;
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

  async loadAll() {
    try {
      const { leaflet } = await loadLeafleat();
      this.setState({
        loading: false,
        loaded: true,
      });
      this.leaflet = leaflet;
    } catch {
      this.setState({
        loading: false,
        loaded: false,
      });
    }
  }

  initMap() {
    const map = this.leaflet.map(this.mapNode);
    const position = [
      this.props.positions[0].latitude,
      this.props.positions[0].longitude,
    ];
    map.setView(position, 13);

    this.leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    this.leaflet
      .marker(position)
      .addTo(map)
      .bindPopup(translate('Service provider'));

    this.forceUpdate();
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    if (this.state.loaded) {
      return (
        <div
          ref={node => (this.mapNode = node)}
          style={{ width: '100%', height: 300 }}
        />
      );
    }
    return null;
  }
}
