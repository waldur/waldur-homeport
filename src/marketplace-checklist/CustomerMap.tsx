import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import loadLeafleat from '@waldur/shims/load-leaflet';

import { ChecklistStats } from './types';

const iconGreen = require('@waldur/images/marker-icon-green.png');
const iconRed = require('@waldur/images/marker-icon-red.png');
const iconYellow = require('@waldur/images/marker-icon-yellow.png');

interface CustomerMapProps {
  customers: ChecklistStats[];
}

export const CustomerMap: React.FC<CustomerMapProps> = ({ customers }) => {
  const [loading, setLoading] = React.useState(true);
  const leafletRef = React.useRef(null);
  const nodeRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);

  React.useEffect(() => {
    async function loadAll() {
      try {
        const { leaflet } = await loadLeafleat();
        const createIcon = iconUrl =>
          new leaflet.Icon({
            iconUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
        const greenIcon = createIcon(iconGreen);
        const redIcon = createIcon(iconRed);
        const yellowIcon = createIcon(iconYellow);

        leafletRef.current = leaflet;
        setLoading(false);

        mapRef.current = leafletRef.current.map(nodeRef.current);
        mapRef.current.fitWorld();

        leafletRef.current
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          })
          .addTo(mapRef.current);

        layerRef.current = leafletRef.current
          .layerGroup()
          .addTo(mapRef.current);
        customers.forEach(customer => {
          if (!customer.longitude || !customer.latitude) {
            return;
          }
          leafletRef.current
            .marker([customer.latitude, customer.longitude], {
              icon:
                customer.score < 25
                  ? redIcon
                  : customer.score < 75
                  ? yellowIcon
                  : greenIcon,
            })
            .bindPopup(`${customer.name}: ${customer.score} %`)
            .addTo(layerRef.current);
        });
      } catch {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  return (
    <>
      {loading && <LoadingSpinner />}
      <div ref={nodeRef} style={{ width: '100%', height: 300 }} />
    </>
  );
};
