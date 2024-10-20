import { LatLngTuple } from 'leaflet';
import React from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { translate } from '@waldur/i18n';
import { CustomMarkerIcon } from '@waldur/map/CustomMarkerIcon';

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
      <Marker position={position} icon={CustomMarkerIcon()}>
        <Popup>{translate('Service provider')}</Popup>
      </Marker>
    </MapContainer>
  );
};
