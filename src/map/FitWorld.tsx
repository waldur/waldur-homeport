import * as React from 'react';
import { useMap } from 'react-leaflet';

export const FitWorld = () => {
  const map = useMap();
  React.useEffect(() => {
    map.fitWorld();
  }, [map]);
  return null;
};
