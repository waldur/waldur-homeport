import Leaflet from 'leaflet';
import React from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import iconGreen from '@waldur/images/marker-icon-green.png';
import iconRed from '@waldur/images/marker-icon-red.png';
import iconYellow from '@waldur/images/marker-icon-yellow.png';
import { FitWorld } from '@waldur/map/FitWorld';
import { OpenStreetMapTileLayer } from '@waldur/map/OpenStreetMapTileLayer';

import { ChecklistStats } from './types';

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
    <OpenStreetMapTileLayer />
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
