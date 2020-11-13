import { GeoSearchControl } from 'leaflet-geosearch';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const SearchControl = (props) => {
  const map = useMap();

  useEffect(() => {
    const searchControl = GeoSearchControl({
      provider: props.provider,
      ...props,
    });

    map.addControl(searchControl);

    map.on('layeradd', (e: any) => {
      if (e.layer._latlng) {
        props.onLocationFound(e.layer._latlng);
        map.setZoom(10);
      }
    });

    return () => map.removeControl(searchControl);
  }, [props, map]);

  return null;
};
