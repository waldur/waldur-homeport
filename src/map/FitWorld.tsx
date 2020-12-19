import { useEffect, FunctionComponent } from 'react';
import { useMap } from 'react-leaflet';

export const FitWorld: FunctionComponent = () => {
  const map = useMap();
  useEffect(() => {
    map.fitWorld();
  }, [map]);
  return null;
};
