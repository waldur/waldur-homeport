import * as L from 'leaflet';
import { createContext, useContext } from 'react';

export const MapContext = createContext<L.Map>(null);

export const MarkerContext = createContext<L.Marker>(null);

export const useMap = (): L.Map => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error('useMap must be called inside a MapContainer.');
  }
  return map;
};

export const useMarker = (): L.Marker => {
  const marker = useContext(MarkerContext);
  if (!marker) {
    throw new Error('useMarker must be called inside a Marker.');
  }
  return marker;
};
