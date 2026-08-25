import * as L from 'leaflet';
import { FunctionComponent, useEffect } from 'react';

import { useMap } from './MapContext';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const ATTRIBUTION =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

export const OpenStreetMapTileLayer: FunctionComponent = () => {
  const map = useMap();

  useEffect(() => {
    const layer = L.tileLayer(TILE_URL, { attribution: ATTRIBUTION });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
};
