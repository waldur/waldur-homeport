import { GeoSearchControl } from 'leaflet-geosearch';
import { useEffect, FunctionComponent } from 'react';
import { useMap } from 'react-leaflet';

export const GeoSearchControlElement: FunctionComponent<any> = (props) => {
  const map = useMap();

  useEffect(() => {
    const searchControl = new GeoSearchControl({
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
