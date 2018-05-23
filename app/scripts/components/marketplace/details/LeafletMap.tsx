import L from 'leaflet';
import * as React from 'react';

export class LeafletMap extends React.Component {
  mapNode: HTMLDivElement;

  componentDidMount() {
    const map = L.map(this.mapNode);
    const position = [51.505, -0.09];
    map.setView(position, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(position)
      .addTo(map)
      .bindPopup('Baker Street.');

    this.forceUpdate();
  }

  render() {
    return (
      <div
        ref={node => this.mapNode = node}
        style={{width: '100%', height: 300}}
      />
    );
  }
}
