import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import loadLeafleat from '../../../shims/load-leaflet';

export class LeafletMap extends React.Component {
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
    const position = [51.505, -0.09];
    map.setView(position, 13);

    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    this.leaflet.marker(position)
      .addTo(map)
      .bindPopup('Baker Street.');

    this.forceUpdate();
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    if (this.state.loaded) {
      return (
        <div
          ref={node => this.mapNode = node}
          style={{width: '100%', height: 300}}
        />
      );
      }
  }
}
