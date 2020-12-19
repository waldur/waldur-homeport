import { basemapLayer } from 'esri-leaflet';
import { Layer } from 'leaflet';
import { useEffect, FunctionComponent } from 'react';
import { useMap } from 'react-leaflet';

export const EsriLayer: FunctionComponent = () => {
  const map = useMap();
  useEffect(() => {
    const layer: Layer = basemapLayer('Gray');
    layer.addTo(map);
    return () => {
      layer.removeFrom(map);
    };
  }, [map]);
  return null;
};
