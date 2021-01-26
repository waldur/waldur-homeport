import { LatLngTuple } from 'leaflet';
import React from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import { translate } from '@waldur/i18n';

import './LeafletMap.scss';
import { OpenStreetMapTileLayer } from './OpenStreetMapTileLayer';
import { GeolocationPoint } from './types';

export const LeafletMap: React.FC<GeolocationPoint> = (props) => {
  const position: LatLngTuple = [props.latitude, props.longitude];
  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ width: '100%', height: 300 }}
    >
      <OpenStreetMapTileLayer />
      <Marker position={position}>
        <Popup>{translate('Service provider')}</Popup>
      </Marker>
    </MapContainer>
  );
};
