import { basemapLayer } from 'esri-leaflet';
import { Layer } from 'leaflet';
import * as React from 'react';
import { useMap } from 'react-leaflet';

export const EsriLayer = () => {
  const map = useMap();
  React.useEffect(() => {
    const layer: Layer = basemapLayer('Gray');
    layer.addTo(map);
    return () => {
      layer.removeFrom(map);
    };
  }, [map]);
  return null;
};
