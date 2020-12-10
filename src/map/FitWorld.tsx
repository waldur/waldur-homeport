import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const FitWorld = () => {
  const map = useMap();
  useEffect(() => {
    map.fitWorld();
  }, [map]);
  return null;
};
