import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { GeolocationPoint } from '@waldur/marketplace/types';
import loadLeafleat from '@waldur/shims/load-leaflet';

interface Customer extends GeolocationPoint {
  name: string;
  score: number;
}

interface CustomerMapProps {
  customers: Customer[];
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
        leafletRef.current = leaflet;
        setLoading(false);

        mapRef.current = leafletRef.current.map(nodeRef.current);
        mapRef.current.fitWorld();

        leafletRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);

        layerRef.current = leafletRef.current.layerGroup().addTo(mapRef.current);
        customers.forEach(customer => {
          if (!customer.longitude || !customer.latitude) {
            return;
          }
          leafletRef.current
            .marker([customer.latitude, customer.longitude])
            .bindPopup(`${customer.name}: ${customer.score}`)
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
      <div
        ref={nodeRef}
        style={{width: '100%', height: 300}}
      />
    </>
  );
};
