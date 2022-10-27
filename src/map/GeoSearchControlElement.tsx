import { LeafletEvent } from 'leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import { useEffect, FunctionComponent } from 'react';
import { useMap } from 'react-leaflet';

export const GeoSearchControlElement: FunctionComponent<any> = (props) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const searchControl = new GeoSearchControl(props);

    map.addControl(searchControl);

    map.on('layeradd', (e: LeafletEvent) => {
      if (e.layer._latlng) {
        props.onLocationFound(e.layer._latlng);
        map.setZoom(10);
      }
    });

    return () => map.removeControl(searchControl);
  }, [props, map]);

  return null;
};
