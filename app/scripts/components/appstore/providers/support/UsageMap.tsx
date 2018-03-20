import { latLngBounds, icon } from 'leaflet';
import * as React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

import './providers-support.scss';

interface Marker {
  latitude: number;
  longitude: number;
  uuid: string;
  type: string;
  usageCount: number;
}

interface UsageMapProps {
  center?: number[];
  zoom?: number;
  id: string;
  data: Marker[];
}

const attribution = '&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors';
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const openstackIcon = 'images/appstore/icon-openstack.png';
const slurmIcon = 'images/appstore/icon-slurm.png';
const amazonIcon = 'images/appstore/icon-amazon.png';

const mapProvidersToIcons = {
  openstack: openstackIcon,
  slurm: slurmIcon,
  amazon: amazonIcon,
};

export default class UsageMap extends React.Component<UsageMapProps, any> {
  render() {
    const { center, zoom, id, data } = this.props;
    const bounds = latLngBounds(center);

    data.map(marker => {
      bounds.extend([marker.latitude, marker.longitude]);
    });

    return (
      <Map
        bounds={bounds}
        center={center}
        zoom={zoom}
        id={id}
      >
        <TileLayer
          attribution={attribution}
          url={url}
        />
        {data.map(entry => {
          const markerIcon = icon({
            iconUrl: mapProvidersToIcons[entry.type],
            iconSize: [entry.usageCount, entry.usageCount],
          });
          return (
            <Marker
              key={entry.uuid}
              icon={markerIcon}
              position={[entry.latitude, entry.longitude]}>
              <Popup>
                <span>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </span>
              </Popup>
            </Marker>
          );
        })}
      </Map>
    );
  }
}
