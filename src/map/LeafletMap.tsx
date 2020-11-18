import { LatLngTuple } from 'leaflet';
import * as React from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import { translate } from '@waldur/i18n';

import './LeafletMap.scss';
import { OpenStreeMapTileLayer } from './OpenStreeMapTileLayer';
import { Geolocations } from './types';

interface LeafletMapProps {
  positions: Geolocations;
}

export const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  const position: LatLngTuple = [
    props.positions[0].latitude,
    props.positions[0].longitude,
  ];
  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ width: '100%', height: 300 }}
    >
      <OpenStreeMapTileLayer />
      <Marker position={position}>
        <Popup>{translate('Service provider')}</Popup>
      </Marker>
    </MapContainer>
  );
};
