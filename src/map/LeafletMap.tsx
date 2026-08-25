import { LatLngTuple } from 'leaflet';
import React from 'react';

import { translate } from '@/i18n';
import { CustomMarkerIcon } from '@/map/CustomMarkerIcon';

import './LeafletMap.scss';

import { MapContainer } from './MapContainer';
import { Marker, Popup } from './Marker';
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
