import Leaflet from 'leaflet';
import * as React from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import { FitWorld } from '@waldur/map/FitWorld';
import { OpenStreeMapTileLayer } from '@waldur/map/OpenStreeMapTileLayer';

import { ChecklistStats } from './types';

const iconGreen = require('@waldur/images/marker-icon-green.png');
const iconRed = require('@waldur/images/marker-icon-red.png');
const iconYellow = require('@waldur/images/marker-icon-yellow.png');

interface CustomerMapProps {
  customers: ChecklistStats[];
}

const createIcon = (iconUrl) =>
  new Leaflet.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const greenIcon = createIcon(iconGreen);
const redIcon = createIcon(iconRed);
const yellowIcon = createIcon(iconYellow);

export const CustomerMap: React.FC<CustomerMapProps> = ({ customers }) => (
  <MapContainer style={{ width: '100%', height: 300 }}>
    <OpenStreeMapTileLayer />
    <FitWorld />
    {customers
      .filter((customer) => customer.longitude && customer.latitude)
      .map((customer, index) => (
        <Marker
          key={index}
          position={[customer.latitude, customer.longitude]}
          icon={
            customer.score < 25
              ? redIcon
              : customer.score < 75
              ? yellowIcon
              : greenIcon
          }
        >
          <Popup>{`${customer.name}: ${customer.score} %`}</Popup>
        </Marker>
      ))}
  </MapContainer>
);
